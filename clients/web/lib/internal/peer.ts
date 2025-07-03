
import { RTC_CONFIG } from "@/config/webrtc"
import { SocketClientEmittedEvent } from "@/types/events"
import { Socket } from "socket.io-client"

export class Peer extends RTCPeerConnection {
  remoteUserMedia = new MediaStream()
  isVideoOn = true
  isAudioOn = true
  constructor(public id: string, public socket: Socket, public localUserMedia: MediaStream) {
    super(RTC_CONFIG)
    // listen for peer events
    this.onicecandidate = (e) => {
      if (e.candidate) {
        this.socket.emit(SocketClientEmittedEvent.RTC_ICE_CANDIDATE, { candidate: e.candidate })
      }
    }
    this.oniceconnectionstatechange = (e) => {
      console.log('Ice candidate state change')
    }
    this.ontrack = (e) => {
      for (const track of e.streams[0].getTracks()) {
        console.log(`[WebRTC:${this.id}] Track kind=${track.kind} enabled=${track.enabled} state=${track.readyState}`)
      }
      this.remoteUserMedia.addTrack(e.track)
    }
    localUserMedia.getTracks().forEach(t => {
      console.log(`[WebRTC:${this.id}] Adding local track kind=${t.kind} enabled=${t.enabled}`)
      this.addTrack(t, localUserMedia)
    })
  }
}