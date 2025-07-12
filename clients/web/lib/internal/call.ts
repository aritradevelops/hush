import { Socket } from "socket.io-client";
import { RTC_CONFIG } from "@/config/webrtc"
import { Call } from "@/types/entities";
import { SocketClientEmittedEvent, SocketServerEmittedEvent } from "@/types/events";
import { Emitter } from "@socket.io/component-emitter"

interface CallManagerEvents {

}

export class CallManager extends Emitter<CallManagerEvents, CallManagerEvents> {
  private callees = new Map<string, Callee>()
  private caller!: Caller
  private status: 'ringing' | 'ongoing' = 'ringing'
  constructor(private call: Call, private socket: Socket) {
    super()
    // these events are emitted from a room of this call id
    // so it's safe to assume that call events are intended for this call only
    this.socket.on(SocketServerEmittedEvent.CALL_JOINED, this.handleCallJoin)
    this.socket.on(SocketServerEmittedEvent.CALL_LEFT, this.handleCallLeft)
    this.socket.on(SocketServerEmittedEvent.RTC_ICE_CANDIDATE, this.handleICECandidate)
    this.socket.on(SocketServerEmittedEvent.RTC_OFFER, this.handleOffer)
    this.socket.on(SocketServerEmittedEvent.RTC_ANSWER, this.handleAnswer)
  }

  get id() {
    return this.call.id
  }

  private async handleCallJoin(data: { from: string }) {
    const callee = this.callees.get(data.from) || new Callee(data.from, true, true, this.socket)
    await callee.dial()
  }
  private async handleCallLeft(data: { from: string }) {
    const callee = this.callees.get(data.from)
    if (!callee) return
    callee.hangUp()
    this.callees.delete(data.from)
  }
  private async handleICECandidate({ from, candidate }: { from: string, candidate: RTCIceCandidate }) {
    const callee = this.callees.get(from)
    if (!callee) return
    console.log(`WebRTC: New ICE candidate received for ${callee.id}`)
    await callee.addIceCandidate(candidate)
  }

  private async handleOffer({ offer, from }: { offer: RTCSessionDescription, from: string }) {
    const callee = this.callees.get(from)
    if (!callee) return
    console.log(`WebRTC: New Offer received for ${callee.id}`)
    await callee.pickUp(offer)
  }

  private async handleAnswer({ answer, from }: { answer: RTCSessionDescription, from: string }) {
    const callee = this.callees.get(from)
    if (!callee) return
    console.log(`WebRTC: New Answer received for ${callee.id}`)
    await callee.accept(answer)
  }



  async join(caller: Caller) {
    this.caller = caller
    this.status = 'ongoing'
    this.socket.emit(SocketClientEmittedEvent.CALL_JOINED, { id: this.call.id })
  }

  start(caller: Caller) {
    this.caller = caller
    this.status = 'ongoing'
    this.socket.emit(SocketClientEmittedEvent.CALL_STARTED, { id: this.call.id })
  }
  leave() {

  }
  end() {

  }

  cleanup() {
    // does some cleanup
    this.socket.off(SocketServerEmittedEvent.CALL_JOINED, this.handleCallJoin)
    this.socket.off(SocketServerEmittedEvent.CALL_LEFT, this.handleCallLeft)
    this.socket.off(SocketServerEmittedEvent.RTC_ICE_CANDIDATE, this.handleICECandidate)
  }
}



/** Callee represents a remote peer in the call */
export class Callee extends RTCPeerConnection {
  userMediaStream: MediaStream
  constructor(
    public readonly id: string,
    public isMuted: boolean,
    public isVideoOff: boolean,
    private socket: Socket,
  ) {
    super(RTC_CONFIG)
    this.userMediaStream = new MediaStream()
    this.addEventListener("icecandidate", e => {
      if (e.candidate) {
        console.log(`WebRTC: New ICE canidate found for peer : ${this.id}`)
        this.socket.emit(SocketClientEmittedEvent.RTC_OFFER, { candidate: e.candidate })
      }
    })
    this.addEventListener("track", e => {
      console.log(`WebRTC: New TRACK added to peer : ${this.id}`)
      this.addTrack(e.track, this.userMediaStream)
    })
  }
  /** dial creates a new offer and sends it to the callee */
  async dial() {
    const offer = await this.createOffer()
    await this.setLocalDescription(offer)
    console.log(`WebRTC: New OFFER created from peer : ${this.id}`)
    this.socket.emit("rtc:offer", { offer })
  }
  /** pickUp accepts an offer and sends an answer to the callee */
  async pickUp(offer: RTCSessionDescription) {
    console.log(`WebRTC: New OFFER recieved for peer : ${this.id}`)
    await this.setRemoteDescription(offer)
    const answer = await this.createAnswer(offer)
    console.log(`WebRTC: New ANSWER created from peer : ${this.id}`)
    this.socket.emit("rtc:answer", { answer })
  }
  /** accept accepts an answer and establishes the connection */
  async accept(answer: RTCSessionDescription) {
    console.log(`WebRTC: New ANSWER recieved for peer : ${this.id}`)
    await this.setRemoteDescription(answer)
  }

  /** hangUp closes the connection and stops the tracks */
  hangUp() {
    console.log(`WebRTC: Closing remote peer : ${this.id}`)
    this.close()
    this.userMediaStream.getTracks().forEach(t => t.stop())
  }
}

/** Caller represents the local peer in a call */
export class Caller {
  private userMedia!: MediaStream
  private deviceMedia?: MediaStream
  constructor(
    public readonly id: string,
    public isMuted: boolean,
    public isVideoOff: boolean,
    private socket: Socket
  ) { }

  async getDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const audioInputs: MediaDeviceInfo[] = []
    const videoInputs: MediaDeviceInfo[] = []
    const audioOutputs: MediaDeviceInfo[] = []
    let hasMic = false, hasCamera = false, hasPermission = false
    for (const device of devices) {
      hasPermission = true
      switch (device.kind) {
        case 'audioinput': {
          hasMic = true
          audioInputs.push(device)
          break
        }
        case 'videoinput': {
          hasCamera = true
          videoInputs.push(device)
          break
        }
        case 'audiooutput': {
          audioOutputs.push(device)
          break
        }
      }
    }
    return {
      hasCamera,
      hasMic,
      hasPermission,
      audioInputs,
      audioOutputs,
      videoInputs
    }
  }
  async init() {
    this.userMedia = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
    if (this.isMuted) this.userMedia.getAudioTracks().forEach(t => t.enabled = false)
    if (this.isVideoOff) this.userMedia.getVideoTracks().forEach(t => t.enabled = false)
  }

  mute() {
    this.userMedia.getAudioTracks().forEach(t => t.kind === 'audio' && (t.enabled = false))
    this.isMuted = true
  }
  unmute() {
    this.userMedia.getAudioTracks().forEach(t => t.kind === 'audio' && (t.enabled = true))
    this.isMuted = false
  }

  turnOffVideo() {
    this.userMedia.getAudioTracks().forEach(t => t.kind === 'audio' && (t.enabled = false))
    this.isVideoOff = true
  }
  turnOnVideo() {
    this.userMedia.getAudioTracks().forEach(t => t.kind === 'audio' && (t.enabled = true))
    this.isVideoOff = false
  }

  getUserMedia() {
    return this.userMedia
  }

  getDeviceMedia() {
    return this.deviceMedia
  }
}