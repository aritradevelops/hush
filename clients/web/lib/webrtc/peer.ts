import { RTC_CONFIG } from "@/config/wetbrtc"
import { SocketClientEmittedEvent } from "@/types/events"
import { UUID } from "crypto"
import { Socket } from "socket.io-client"

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
  constructor(
    private _id: UUID,
    private isPolite: boolean,
    private socket: Socket,
    private localUserMedia: MediaStream,
    private localDeviceMedia: MediaStream | null,
  ) {
    this.conn = new RTCPeerConnection(RTC_CONFIG)
    this.remoteUserMedia = new MediaStream()
    this.remoteDeviceMedia = null
    this.worker = new window.Worker('/workers/video-decrypt.worker.ts', {
      type: 'module'
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

    this.localUserMedia.getTracks().forEach(t => {
      this.conn.addTrack(t, this.localUserMedia)
      this.debugLog(`Added local user media track: ${t.kind}`)
    })

    this.conn.onnegotiationneeded = async () => {
      this.debugLog('onnegotiationneeded triggered')
      try {
        this.makingOffer = true
        await this.conn.setLocalDescription()
        this.debugLog('Sending offer SDP')
        this.socket.emit(SocketClientEmittedEvent.RTC_SESSCION_DESCRIPTION, {
          description: this.conn.localDescription,
          to: this.id
        })
      } catch (err) {
        console.error(err)
      } finally {
        this.makingOffer = false
      }
    }

    this.conn.onicecandidate = ({ candidate }) => {
      this.debugLog('ICE candidate generated', candidate)
      this.socket.emit(SocketClientEmittedEvent.RTC_ICE_CANDIDATE, {
        candidate,
        to: this.id
      })
    }

    this.conn.ontrack = ({ track }) => {
      this.debugLog(`Track received from remote: ${track.kind}`)
      this.remoteUserMedia.addTrack(track)
    }

    this.conn.onconnectionstatechange = () => {
      this.debugLog('Connection state changed:', this.conn.connectionState)
    }
  }

  async handleSessionDescription(description: RTCSessionDescription) {
    try {
      this.debugLog('Received session description', description)

      const readyForOffer = !this.makingOffer && (this.conn.signalingState === "stable" || this.isPolite)
      const offerCollision = description.type === "offer" && !readyForOffer
      this.ignoreOffer = !this.isPolite && offerCollision

      if (this.ignoreOffer) {
        this.debugLog('Offer ignored due to collision and being impolite')
        return
      }

      if (description.type === "offer") {
        await this.conn.setRemoteDescription(description)
        this.debugLog('Set remote description from offer')
        await this.conn.setLocalDescription()
        this.debugLog('Sending answer SDP')
        this.socket.emit(SocketClientEmittedEvent.RTC_SESSCION_DESCRIPTION, {
          description: this.conn.localDescription,
          to: this.id
        })
      } else {
        await this.conn.setRemoteDescription(description)
        this.debugLog('Set remote description from answer')
      }
    } catch (err) {
      console.error("Negotiation error:", err)
    }
  }

  async handleICECandidate(candidate: RTCIceCandidate) {
    try {
      await this.conn.addIceCandidate(candidate)
      this.debugLog('Added remote ICE candidate')
    } catch (error) {
      if (!this.ignoreOffer) {
        console.error("Negotiation Error", error)
      }
    }
  }

  addTrack(track: MediaStreamTrack, kind: 'user' | 'device') {
    const stream = kind === 'user' ? this.localUserMedia : this.localDeviceMedia
    if (stream) {
      this.debugLog(`Connection State`, this.conn.connectionState)
      this.conn.addTrack(track, stream)
      this.conn.dispatchEvent(new Event('negotiationneeded'))
      this.debugLog(`Track added dynamically: ${track.kind} (${kind})`)
    }
  }

  removeTrack(track: MediaStreamTrack) {
    const sender = this.conn.getSenders().find(s => s.track === track)
    if (sender) {
      this.conn.removeTrack(sender)
      this.conn.dispatchEvent(new Event('negotiationneeded'))
      this.debugLog(`Track removed dynamically: ${track.kind}`)
    }
  }
}
