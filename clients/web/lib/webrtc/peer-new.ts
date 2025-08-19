import { RTC_CONFIG } from "@/config/wetbrtc"
import { SocketClientEmittedEvent, SocketServerEmittedEvent } from "@/types/events"
import type { UUID } from "crypto"
import type { Socket } from "socket.io-client"
import type { Call } from "@/types/entities"
import type { PeerWorkerMessage } from "@/types/peer-worker"

type OnRemoteMicChange = (state: "muted" | "unmuted") => void
type OnRemoteCameraChange = (state: "muted" | "unmuted") => void
type OnRemoteStreamsChanged = (params: {
  remoteUserStream: MediaStream
  remoteScreenStream: MediaStream | null
}) => void

type ControlMessage =
  | { type: "mic"; state: "muted" | "unmuted" }
  | { type: "camera"; state: "muted" | "unmuted" }

/**
 * PeerNew implements:
 * - Perfect negotiation (polite/impolite)
 * - Multiple streams: primary user media (camera+mic) and optional screen share
 * - E2EE using Insertable Streams via worker `/workers/peer.worker.js`
 * - Device switching and mute/camera toggle with control data channel notifications
 */
export class PeerNew {
  private conn: RTCPeerConnection
  private worker: Worker

  private makingOffer = false
  private ignoreOffer = false
  private debugMode = process.env.NODE_ENV !== "production"
  private isInitialized = false

  private pendingIceCandidates: RTCIceCandidate[] = []

  // Local streams
  private localUserStream: MediaStream | null
  private localScreenStream: MediaStream | null

  // Remote streams we expose for rendering
  private remoteUserStream: MediaStream
  private remoteScreenStream: MediaStream | null

  // Cached senders for convenience
  private userAudioSender: RTCRtpSender | null = null
  private userVideoSender: RTCRtpSender | null = null
  private screenVideoSender: RTCRtpSender | null = null

  // UI state flags
  public remoteMicMuted = true
  public remoteCameraOff = true

  // Event callbacks
  private onRemoteMicChangeCb: OnRemoteMicChange | null
  private onRemoteCameraChangeCb: OnRemoteCameraChange | null
  private onRemoteStreamsChangedCb: OnRemoteStreamsChanged | null

  constructor(
    private peerId: UUID,
    private isPolite: boolean,
    private socket: Socket,
    userStream: MediaStream | null,
    screenStream: MediaStream | null,
    private call: Call,
    private sharedSecret: string,
  ) {
    this.conn = new RTCPeerConnection(RTC_CONFIG)
    this.worker = new window.Worker("/workers/peer.worker.js", {
      type: "module",
      name: `${this.peerId}_e2ee_new`,
    })

    this.localUserStream = userStream
    this.localScreenStream = screenStream

    this.remoteUserStream = new MediaStream()
    this.remoteScreenStream = null

    this.onRemoteMicChangeCb = null
    this.onRemoteCameraChangeCb = null
    this.onRemoteStreamsChangedCb = null

    this.debugLog(`PeerNew ${this.peerId} created. Polite: ${this.isPolite}`)
  }

  private debugLog(...args: any[]) {
    // if (this.debugMode) console.debug(`[PeerNew ${this.peerId}]`, ...args)
    if (this.debugMode) console.debug(...args)
  }

  get id() {
    return this.peerId
  }

  get RemoteUserStream() {
    return this.remoteUserStream
  }

  get RemoteScreenStream() {
    return this.remoteScreenStream
  }

  onRemoteMicChange(cb: OnRemoteMicChange) {
    this.onRemoteMicChangeCb = cb
  }

  onRemoteCameraChange(cb: OnRemoteCameraChange) {
    this.onRemoteCameraChangeCb = cb
  }

  onRemoteStreamsChanged(cb: OnRemoteStreamsChanged) {
    this.onRemoteStreamsChangedCb = cb
  }

  private isSettingRemoteAnswerPending(): boolean {
    return this.conn.signalingState === "have-local-offer"
  }

  async init() {
    // Initialize E2EE worker
    this.worker.postMessage({
      type: "init",
      data: { iv: this.call.iv, sharedSecret: this.sharedSecret },
    } as PeerWorkerMessage)

    // Add initial local tracks
    if (this.localUserStream) {
      this.localUserStream.getTracks().forEach((track) => {
        const sender = this.conn.addTrack(track, this.localUserStream!)
        // this.setupSendTransform(sender)
        if (track.kind === "audio") this.userAudioSender = sender
        if (track.kind === "video") this.userVideoSender = sender
      })
    }

    if (this.localScreenStream) {
      this.localScreenStream.getTracks().forEach((track) => {
        const sender = this.conn.addTrack(track, this.localScreenStream!)
        // this.setupSendTransform(sender)
        if (track.kind === "video") this.screenVideoSender = sender
      })
    }

    // Subscribe to socket-based control events (mic/camera)
    this.socket.on(SocketServerEmittedEvent.CALL_MIC, this.handleSocketMic)
    this.socket.on(SocketServerEmittedEvent.CALL_CAMERA, this.handleSocketCamera)

    this.conn.onnegotiationneeded = async () => {
      this.debugLog("onnegotiationneeded")
      try {
        this.makingOffer = true
        await this.conn.setLocalDescription()
        this.debugLog("Sending local description", this.conn.localDescription?.type)
        this.socket.emit(SocketClientEmittedEvent.RTC_SESSCION_DESCRIPTION, {
          description: this.conn.localDescription,
          to: this.id,
        })
      } catch (err) {
        console.error("Negotiation error (onnegotiationneeded):", err)
      } finally {
        this.makingOffer = false
      }
    }

    this.conn.onicecandidate = ({ candidate }) => {
      if (candidate) {
        this.socket.emit(SocketClientEmittedEvent.RTC_ICE_CANDIDATE, {
          candidate,
          to: this.id,
        })
      }
    }

    this.conn.ontrack = ({ track, streams, receiver }) => {
      this.debugLog("remote track:", track.kind, track.id, streams.map((s) => s.id))

      // Route video tracks: first video -> user stream, second video -> screen stream
      if (track.kind === "video") {
        if (!this.hasVideoTrack(this.remoteUserStream)) {
          this.remoteUserStream.addTrack(track)
        } else {
          if (!this.remoteScreenStream) this.remoteScreenStream = new MediaStream()
          this.remoteScreenStream.addTrack(track)
        }
        this.remoteCameraOff = false
        this.onRemoteCameraChangeCb?.("unmuted")
        this.onRemoteStreamsChangedCb?.({
          remoteUserStream: this.remoteUserStream,
          remoteScreenStream: this.remoteScreenStream,
        })
      }

      if (track.kind === "audio") {
        this.remoteUserStream.addTrack(track)
        this.remoteMicMuted = false
        this.onRemoteMicChangeCb?.("unmuted")
        this.onRemoteStreamsChangedCb?.({
          remoteUserStream: this.remoteUserStream,
          remoteScreenStream: this.remoteScreenStream,
        })
      }

      // Apply E2EE receive transform
      // this.setupReceiveTransform(receiver)

      track.onended = () => {
        if (track.kind === "video") {
          if (this.remoteScreenStream && this.remoteScreenStream.getVideoTracks().some((t) => t.id === track.id)) {
            this.remoteScreenStream.removeTrack(track)
            if (this.remoteScreenStream.getTracks().length === 0) this.remoteScreenStream = null
          } else {
            this.remoteUserStream.removeTrack(track)
          }
          if (!this.hasAnyRemoteVideo()) {
            this.remoteCameraOff = true
            this.onRemoteCameraChangeCb?.("muted")
          }
        }
        if (track.kind === "audio") {
          this.remoteUserStream.removeTrack(track)
          if (!this.remoteUserStream.getAudioTracks().length) {
            this.remoteMicMuted = true
            this.onRemoteMicChangeCb?.("muted")
          }
        }
        this.onRemoteStreamsChangedCb?.({
          remoteUserStream: this.remoteUserStream,
          remoteScreenStream: this.remoteScreenStream,
        })
      }
    }

    this.conn.oniceconnectionstatechange = () => {
      this.debugLog("iceConnectionState:", this.conn.iceConnectionState)
    }
    this.conn.onsignalingstatechange = () => {
      this.debugLog("signalingState:", this.conn.signalingState)
    }
    this.conn.onconnectionstatechange = () => {
      this.debugLog("connectionState:", this.conn.connectionState)
      if (this.conn.connectionState === "failed") this.conn.restartIce()
    }

    this.isInitialized = true
  }

  // Signaling handlers
  async handleSessionDescription(description: RTCSessionDescriptionInit) {
    try {
      this.debugLog("handleSessionDescription", description.type)

      const readyForOffer = !this.makingOffer && (this.conn.signalingState === "stable" || this.isSettingRemoteAnswerPending())
      const offerCollision = description.type === "offer" && !readyForOffer
      this.ignoreOffer = !this.isPolite && offerCollision

      if (this.ignoreOffer) {
        this.debugLog("Ignoring offer due to glare (impolite)")
        return
      }

      if (offerCollision) {
        this.debugLog("Offer collision detected; rolling back")
        await this.conn.setLocalDescription({ type: "rollback" })
      }

      await this.conn.setRemoteDescription(description)

      // Drain queued ICE candidates
      if (this.pendingIceCandidates.length) {
        for (const c of this.pendingIceCandidates) {
          try {
            await this.conn.addIceCandidate(c)
          } catch (e) {
            if (!this.ignoreOffer) console.error("addIceCandidate (drain) error:", e)
          }
        }
        this.pendingIceCandidates = []
      }

      if (description.type === "offer") {
        await this.conn.setLocalDescription()
        this.socket.emit(SocketClientEmittedEvent.RTC_SESSCION_DESCRIPTION, {
          description: this.conn.localDescription,
          to: this.id,
        })
      }
    } catch (err) {
      console.error("handleSessionDescription error:", err)
    }
  }

  async handleICECandidate(candidate: RTCIceCandidate) {
    try {
      if (this.conn.remoteDescription) {
        await this.conn.addIceCandidate(candidate)
      } else {
        this.debugLog("Queueing ICE candidate until remoteDescription is set")
        this.pendingIceCandidates.push(candidate)
      }
    } catch (err) {
      if (!this.ignoreOffer) console.error("addIceCandidate error:", err)
    }
  }

  // Mute/unmute local mic and notify call members via socket
  muteMic() {
    if (this.localUserStream) {
      this.localUserStream.getAudioTracks().forEach((t) => (t.enabled = false))
      this.socket.emit(SocketClientEmittedEvent.CALL_MIC, { channel_id: this.call.channel_id, state: 'muted' })
    }
  }
  unmuteMic() {
    if (this.localUserStream) {
      this.localUserStream.getAudioTracks().forEach((t) => (t.enabled = true))
      this.socket.emit(SocketClientEmittedEvent.CALL_MIC, { channel_id: this.call.channel_id, state: 'unmuted' })
    }
  }

  // Camera on/off and notify remote. Uses RTCRtpSender parameters when available; falls back to track.enabled
  async cameraOff() {
    if (this.userVideoSender && this.userVideoSender.getParameters) {
      const params = this.userVideoSender.getParameters()
      if (params.encodings && params.encodings.length) {
        params.encodings.forEach((e) => (e.active = false))
        await this.userVideoSender.setParameters(params)
      }
    }
    if (this.localUserStream) this.localUserStream.getVideoTracks().forEach((t) => (t.enabled = false))
    this.socket.emit(SocketClientEmittedEvent.CALL_CAMERA, { channel_id: this.call.channel_id, state: 'muted' })
  }
  async cameraOn() {
    if (this.userVideoSender && this.userVideoSender.getParameters) {
      const params = this.userVideoSender.getParameters()
      if (params.encodings && params.encodings.length) {
        params.encodings.forEach((e) => (e.active = true))
        await this.userVideoSender.setParameters(params)
      }
    }
    if (this.localUserStream) this.localUserStream.getVideoTracks().forEach((t) => (t.enabled = true))
    this.socket.emit(SocketClientEmittedEvent.CALL_CAMERA, { channel_id: this.call.channel_id, state: 'unmuted' })
  }

  // Device switching helpers
  async replaceCameraTrack(newVideoTrack: MediaStreamTrack) {
    if (!this.localUserStream) this.localUserStream = new MediaStream()

    // Remove old video tracks from local user stream
    this.localUserStream.getVideoTracks().forEach((t) => this.localUserStream!.removeTrack(t))
    this.localUserStream.addTrack(newVideoTrack)

    if (this.userVideoSender) {
      await this.userVideoSender.replaceTrack(newVideoTrack)
      // this.setupSendTransform(this.userVideoSender)
    } else {
      const sender = this.conn.addTrack(newVideoTrack, this.localUserStream)
      this.userVideoSender = sender
      // this.setupSendTransform(sender)
    }
  }

  async replaceMicTrack(newAudioTrack: MediaStreamTrack) {
    if (!this.localUserStream) this.localUserStream = new MediaStream()

    this.localUserStream.getAudioTracks().forEach((t) => this.localUserStream!.removeTrack(t))
    this.localUserStream.addTrack(newAudioTrack)

    if (this.userAudioSender) {
      await this.userAudioSender.replaceTrack(newAudioTrack)
      // this.setupSendTransform(this.userAudioSender)
    } else {
      const sender = this.conn.addTrack(newAudioTrack, this.localUserStream)
      this.userAudioSender = sender
      // this.setupSendTransform(sender)
    }
  }

  // Screen share management
  async startScreenShare(screenStream: MediaStream) {
    this.localScreenStream = screenStream
    const [screenTrack] = screenStream.getVideoTracks()
    if (!screenTrack) return
    if (this.screenVideoSender) {
      await this.screenVideoSender.replaceTrack(screenTrack)
      // this.setupSendTransform(this.screenVideoSender)
    } else {
      const sender = this.conn.addTrack(screenTrack, screenStream)
      this.screenVideoSender = sender
      // this.setupSendTransform(sender)
    }
  }

  stopScreenShare() {
    if (this.screenVideoSender) {
      // Remove sender from connection
      try {
        this.conn.removeTrack(this.screenVideoSender)
      } catch (e) {
        this.debugLog("removeTrack screen sender failed", e)
      }
      this.screenVideoSender = null
    }
    if (this.localScreenStream) {
      this.localScreenStream.getTracks().forEach((t) => t.stop())
      this.localScreenStream = null
    }
  }

  // Internal E2EE helpers
  private setupSendTransform(sender: RTCRtpSender) {
    if ((window as any).RTCRtpScriptTransform) {
      sender.transform = new (window as any).RTCRtpScriptTransform(this.worker, { operation: "encrypt" })
      return
    }
    const streams = sender.createEncodedStreams!()
    const { readable, writable } = streams
    this.worker.postMessage(
      { type: "encrypt", data: { readable, writable } } as PeerWorkerMessage,
      [readable as any, writable as any],
    )
  }

  private setupReceiveTransform(receiver: RTCRtpReceiver) {
    if ((window as any).RTCRtpScriptTransform) {
      receiver.transform = new (window as any).RTCRtpScriptTransform(this.worker, { operation: "decrypt" })
      return
    }
    const streams = receiver.createEncodedStreams!()
    const { readable, writable } = streams
    this.worker.postMessage(
      { type: "decrypt", data: { readable, writable } } as PeerWorkerMessage,
      [readable as any, writable as any],
    )
  }

  // Socket control handlers
  private handleSocketMic = (data: { channel_id: UUID; state: 'muted' | 'unmuted'; from: UUID }) => {
    if (data.channel_id !== this.call.channel_id) return
    if (data.from !== this.peerId) return
    this.remoteMicMuted = data.state === 'muted'
    this.onRemoteMicChangeCb?.(data.state)
  }
  private handleSocketCamera = (data: { channel_id: UUID; state: 'muted' | 'unmuted'; from: UUID }) => {
    if (data.channel_id !== this.call.channel_id) return
    if (data.from !== this.peerId) return
    this.remoteCameraOff = data.state === 'muted'
    this.onRemoteCameraChangeCb?.(data.state)
  }

  private hasVideoTrack(stream: MediaStream): boolean {
    return stream.getVideoTracks().length > 0
  }

  private hasAnyRemoteVideo(): boolean {
    return (
      (this.remoteUserStream && this.remoteUserStream.getVideoTracks().length > 0) ||
      (this.remoteScreenStream && this.remoteScreenStream.getVideoTracks().length > 0) ||
      false
    )
  }

  close() {
    try {
      this.socket.off(SocketServerEmittedEvent.CALL_MIC, this.handleSocketMic)
      this.socket.off(SocketServerEmittedEvent.CALL_CAMERA, this.handleSocketCamera)
    } catch { }
    try {
      this.conn.close()
    } catch { }
    try {
      this.worker.terminate()
    } catch { }
  }
}


