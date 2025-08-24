import { RTC_CONFIG } from "@/config/wetbrtc"
import { SocketClientEmittedEvent } from "@/types/events"
import { UUID } from "crypto"
import { Socket } from "socket.io-client"
import { AESCTR } from "../encryption"
import { Base64Utils } from "../base64"
import { Call } from "@/types/entities"
import { PeerWorkerMessage } from "@/types/peer-worker"
import { WorkerMessage } from "@/types/upload-worker"
type OnMicChangeCallback = (state: 'muted' | 'unmuted') => void
type OnCameraChangeCallback = (state: 'muted' | 'unmuted') => void
export class Peer {
  private conn: RTCPeerConnection
  private worker: Worker
  private remoteUserMedia: MediaStream
  private remoteDeviceMedia: MediaStream | null
  public isMuted = true
  public isVideoOff = false
  private makingOffer = false
  private ignoreOffer = false
  private debugMode = process.env.NODE_ENV !== 'production'
  private isInitialized = false

  constructor(
    private _id: UUID,
    private isPolite: boolean,
    private socket: Socket,
    private localUserMedia: MediaStream,
    private localDeviceMedia: MediaStream | null,
    private call: Call,
    private sharedSecret: string,
    private onMicChangeCallback: OnMicChangeCallback | null = null,
    private onCameraChangeCallback: OnCameraChangeCallback | null = null,
  ) {
    this.conn = new RTCPeerConnection(RTC_CONFIG)
    this.remoteUserMedia = new MediaStream()
    this.remoteDeviceMedia = null
    this.worker = new window.Worker('/workers/peer.worker.js', {
      type: 'module',
      name: `${this._id}_e2ee`
    })
    this.debugLog(`Peer ${this._id} created. Polite: ${this.isPolite}`)
  }

  private debugLog(...args: any[]) {
    if (this.debugMode) console.debug(`[Peer ${this._id}]`, ...args)
  }

  get id() {
    return this._id
  }

  get RemoteUserMedia() {
    return this.remoteUserMedia
  }

  async init() {
    this.debugLog('Initializing peer connection')

    // Initialize the worker
    this.worker.postMessage({
      type: 'init',
      data: {
        iv: this.call.iv,
        sharedSecret: this.sharedSecret
      }
    } as PeerWorkerMessage)

    // Initialize with existing tracks
    this.localUserMedia.getTracks().forEach(t => {
      this.conn.addTrack(t, this.localUserMedia)
      this.debugLog(`Added local user media track: ${t.kind}`)
    })

    // Add device media tracks if available
    if (this.localDeviceMedia) {
      this.localDeviceMedia.getTracks().forEach(t => {
        this.conn.addTrack(t, this.localDeviceMedia!)
        this.debugLog(`Added local device media track: ${t.kind}`)
      })
    }

    this.conn.onnegotiationneeded = async () => {
      this.debugLog('onnegotiationneeded triggered')
      try {
        this.makingOffer = true
        await this.conn.setLocalDescription()
        this.debugLog('Sending offer SDP', this.conn.localDescription?.type)
        this.socket.emit(SocketClientEmittedEvent.RTC_SESSCION_DESCRIPTION, {
          description: this.conn.localDescription,
          to: this.id
        })
      } catch (err) {
        console.error('Error in negotiation needed:', err)
      } finally {
        this.makingOffer = false
      }
    }

    this.conn.onicecandidate = ({ candidate }) => {
      this.debugLog('ICE candidate generated:', candidate)
      if (candidate) {
        this.socket.emit(SocketClientEmittedEvent.RTC_ICE_CANDIDATE, {
          candidate,
          to: this.id
        })
      } else {
        this.debugLog('ICE gathering completed (null candidate)')
      }
    }

    this.conn.ontrack = ({ track, streams, receiver }) => {
      this.debugLog(`Track received from remote: ${track.kind}`)
      this.debugLog('Track streams:', streams)
      // Remove existing tracks of the same kind
      this.remoteUserMedia.getTracks()
        .filter(t => t.kind === track.kind)
        .forEach(oldTrack => {
          this.debugLog(`Removing old ${oldTrack.kind} track: ${oldTrack.id}`)
          this.remoteUserMedia.removeTrack(oldTrack)
          oldTrack.stop()
        })


      // Add track to remote media stream
      this.remoteUserMedia.addTrack(track)
      this.setupReceiveTransform(receiver)

      // Log when track ends
      // track.onended = () => {
      //   this.debugLog(`Remote track ended: ${track.kind}`)
      // }
      if (track.kind === 'video') {
        this.isVideoOff = false
        this.debugLog('Video track added, setting isVideoOff = false')
        if (this.onCameraChangeCallback) {
          this.onCameraChangeCallback('unmuted')
        }
      }
      if (track.kind === 'audio') {
        this.isMuted = false
        this.debugLog('Audio track added, setting isMuted = false')
        if (this.onMicChangeCallback) {
          this.onMicChangeCallback('unmuted')
        }
      }
      track.onended = () => {
        this.debugLog(`Remote track ended: ${track.kind}`)
        this.remoteUserMedia.removeTrack(track)

        if (track.kind === 'video') {
          this.isVideoOff = true
          this.debugLog('Video track ended, setting isVideoOff = true')
          if (this.onCameraChangeCallback) {
            this.onCameraChangeCallback('muted')
          }
        }

        if (track.kind === 'audio') {
          this.isMuted = true
          this.debugLog('Audio track ended, setting isMuted = true')
          if (this.onMicChangeCallback) {
            this.onMicChangeCallback('muted')
          }
        }
      }

      track.onmute = () => {
        this.debugLog(`Remote track muted: ${track.kind}`)
        if (track.kind === 'video' && this.onCameraChangeCallback) {
          this.onCameraChangeCallback('muted')
        }
        if (track.kind === 'audio' && this.onMicChangeCallback) {
          this.onMicChangeCallback('muted')
        }
      }
      track.onunmute = () => {
        if (track.kind === 'video' && this.onCameraChangeCallback) {
          this.onCameraChangeCallback('unmuted')
        }
        if (track.kind === 'audio' && this.onMicChangeCallback) {
          this.onMicChangeCallback('unmuted')
        }
        this.debugLog(`Remote track unmuted: ${track.kind}`)
      }
    }

    this.conn.onconnectionstatechange = () => {
      this.debugLog('Connection state changed:', this.conn.connectionState)

      if (this.conn.connectionState === 'failed') {
        this.debugLog('Connection failed, attempting to restart ICE')
        this.conn.restartIce()
      }
    }

    this.conn.oniceconnectionstatechange = () => {
      this.debugLog('ICE connection state:', this.conn.iceConnectionState)
    }

    this.conn.onicegatheringstatechange = () => {
      this.debugLog('ICE gathering state:', this.conn.iceGatheringState)
    }

    this.conn.onsignalingstatechange = () => {
      this.debugLog('Signaling state:', this.conn.signalingState)
    }

    this.conn.onicecandidateerror = (e) => {
      console.error('ICE candidate error:', e)
    }

    this.isInitialized = true
  }

  onMicChange(cb: OnMicChangeCallback) {
    this.onMicChangeCallback = cb
  }
  onCameraChange(cb: OnCameraChangeCallback) {
    this.onCameraChangeCallback = cb
  }

  async handleSessionDescription(description: RTCSessionDescription) {
    try {
      this.debugLog('Received session description:', description.type)
      this.debugLog('Current signaling state:', this.conn.signalingState)
      this.debugLog('Making offer:', this.makingOffer)

      const readyForOffer = !this.makingOffer && (this.conn.signalingState === "stable" || this.isPolite)
      const offerCollision = description.type === "offer" && !readyForOffer
      this.ignoreOffer = !this.isPolite && offerCollision

      if (this.ignoreOffer) {
        this.debugLog('Offer ignored due to collision and being impolite')
        return
      }

      if (offerCollision) {
        this.debugLog('Offer collision detected, rolling back')
        await this.conn.setLocalDescription({ type: "rollback" })
      }

      await this.conn.setRemoteDescription(description)
      this.debugLog('Set remote description from', description.type)

      if (description.type === "offer") {
        await this.conn.setLocalDescription()
        this.debugLog('Sending answer SDP')
        this.socket.emit(SocketClientEmittedEvent.RTC_SESSCION_DESCRIPTION, {
          description: this.conn.localDescription,
          to: this.id
        })
      }
    } catch (err) {
      console.error("Negotiation error:", err)
    }
  }

  async handleICECandidate(candidate: RTCIceCandidate) {
    try {
      this.debugLog('Received ICE candidate:', candidate)

      // Wait for remote description to be set
      if (this.conn.remoteDescription) {
        await this.conn.addIceCandidate(candidate)
        this.debugLog('Added remote ICE candidate successfully')
      } else {
        this.debugLog('Remote description not set, queueing ICE candidate')
        // You might want to queue candidates here if remote description isn't set
      }
    } catch (error) {
      if (!this.ignoreOffer) {
        console.error("ICE candidate error:", error)
      }
    }
  }

  async addTrack(track: MediaStreamTrack, kind: 'user' | 'device') {
    if (!this.isInitialized) {
      this.debugLog('Peer not initialized, cannot add track')
      return
    }

    const stream = kind === 'user' ? this.localUserMedia : this.localDeviceMedia
    if (!stream) {
      this.debugLog(`No ${kind} stream available`)
      return
    }

    try {
      // Check if track is already being sent
      const existingSender = this.conn.getSenders().find(s => s.track === track)
      if (existingSender) {
        this.debugLog(`Track already being sent: ${track.kind}`)
        return
      }

      this.debugLog(`Connection State: ${this.conn.connectionState}`)
      this.debugLog(`Signaling State: ${this.conn.signalingState}`)

      // Add track to stream first
      stream.addTrack(track)

      // Add track to peer connection
      const sender = this.conn.addTrack(track, stream)
      this.setupSendTransform(sender)
      this.debugLog(`Track added to peer connection: ${track.kind} (${kind})`)
      // await this.reNegotiate()
      // The onnegotiationneeded event should fire automatically
      // Don't manually trigger negotiation here

    } catch (error) {
      console.error('Error adding track:', error)
    }
  }

  async removeTrack(track: MediaStreamTrack) {
    if (!this.isInitialized) {
      this.debugLog('Peer not initialized, cannot remove track')
      return
    }

    try {
      const sender = this.conn.getSenders().find(s => s.track === track)
      if (sender) {
        track.stop()
        this.conn.removeTrack(sender)
        this.debugLog(`Track removed from peer connection: ${track.kind}`)

        // Remove from local streams
        this.localUserMedia.removeTrack(track)
        if (this.localDeviceMedia) {
          this.localDeviceMedia.removeTrack(track)
        }

        // The onnegotiationneeded event should fire automatically
        // Don't manually trigger negotiation here
      } else {
        this.debugLog(`Sender not found for track: ${track.kind}`)
      }
    } catch (error) {
      console.error('Error removing track:', error)
    }
  }

  // Helper method to get connection stats for debugging
  async getStats() {
    const stats = await this.conn.getStats()
    const statsObj: any = {}

    stats.forEach((report) => {
      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        statsObj.connectedCandidatePair = report
      }
      if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
        statsObj.inboundVideo = report
      }
      if (report.type === 'outbound-rtp' && report.mediaType === 'video') {
        statsObj.outboundVideo = report
      }
    })

    return statsObj
  }
  async reNegotiate() {
    this.debugLog('Renegotiating...')
    try {
      this.makingOffer = true
      await this.conn.setLocalDescription()
      this.debugLog('Sending offer SDP', this.conn.localDescription?.type)
      this.socket.emit(SocketClientEmittedEvent.RTC_SESSCION_DESCRIPTION, {
        description: this.conn.localDescription,
        to: this.id
      })
    } catch (err) {
      console.error('Error in negotiation needed:', err)
    } finally {
      this.makingOffer = false
    }
  }
  private setupSendTransform(sender: RTCRtpSender) {
    if (window.RTCRtpScriptTransform) {
      this.debugLog("using RTCRtpScriptTransform")
      sender.transform = new RTCRtpScriptTransform(this.worker, { operation: 'encrypt' });
      return;
    }

    const senderStreams = sender.createEncodedStreams!();
    // Instead of creating the transform stream here, we do a postMessage to the worker. The first
    // argument is an object defined by us, the second is a list of variables that will be transferred to
    // the worker. See
    //   https://developer.mozilla.org/en-US/docs/Web/API/Worker/postMessage
    const { readable, writable } = senderStreams;
    this.worker.postMessage({
      type: 'encrypt',
      data: {
        readable,
        writable
      }
    } as PeerWorkerMessage, [readable, writable]);
  }
  private setupReceiveTransform(receiver: RTCRtpReceiver) {
    if (window.RTCRtpScriptTransform) {
      this.debugLog("using RTCRtpScriptTransform")
      receiver.transform = new RTCRtpScriptTransform(this.worker, { operation: 'decrypt' });
      return;
    }

    const receiverStreams = receiver.createEncodedStreams!();
    const { readable, writable } = receiverStreams;
    this.worker.postMessage({
      type: 'decrypt',
      data: {
        readable,
        writable
      }
    } as PeerWorkerMessage, [readable, writable]);
  }

  close() {
    this.debugLog('Closing peer connection')

    // Stop all tracks
    this.remoteUserMedia.getTracks().forEach(track => track.stop())
    this.remoteDeviceMedia?.getTracks().forEach(track => track.stop())

    // Close connection
    this.conn.close()

    // Terminate worker
    this.worker.terminate()
  }
}