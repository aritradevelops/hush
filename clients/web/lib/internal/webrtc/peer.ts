
import { RTC_CONFIG } from "@/config/webrtc"
import { Base64Utils } from "@/lib/base64"
import { AESCTR } from "@/lib/encryption"
import { SocketClientEmittedEvent } from "@/types/events"
import { Socket } from "socket.io-client"
import keysManager from "../keys-manager"

export class Peer extends RTCPeerConnection {
  remoteUserMedia = new MediaStream()
  isVideoOn = true
  isAudioOn = true
  constructor(public id: string, public socket: Socket, public localUserMedia: MediaStream, private sharedSecret: string, private counter: string) {
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
    this.handleEncryption(this.sharedSecret, this.counter)
    localUserMedia.getTracks().forEach(t => {
      console.log(`[WebRTC:${this.id}] Adding local track kind=${t.kind} enabled=${t.enabled}`)
      this.addTrack(t, localUserMedia)
    })
  }

  handleEncryption(sharedSecret: string, counter: string) {
    const sender = this.getSenders().find(s => s.track?.kind === 'video');
    if (!sender) {
      console.warn('No video track found!')
      return
    }
    if (!sender.createEncodedStreams) {
      throw new Error('Video encryption is not supported by your browser')
    }
    const senderStreams = sender!.createEncodedStreams!();
    const readableSend = senderStreams.readable;
    const writableSend = senderStreams.writable;
    const transformStreamEncrypt = new TransformStream({
      async transform(chunk, controller) {
        // Encrypt `chunk.data` with AES
        const { encrypted } = await AESCTR.encrypt(chunk.data, Base64Utils.decode(sharedSecret), counter)
        chunk.data = encrypted;
        controller.enqueue(chunk);
      }
    });
    readableSend.pipeThrough(transformStreamEncrypt).pipeTo(writableSend)

    const receiver = this.getReceivers().find(r => r.track.kind === 'video');
    const { readable: readableRecv, writable: writableRecv } = receiver!.createEncodedStreams!();
    const decryptStream = new TransformStream({
      async transform(chunk, controller) {
        const { decrypted } = await AESCTR.decrypt(chunk.data, counter, Base64Utils.decode(sharedSecret))
        chunk.data = decrypted;
        controller.enqueue(chunk);
      }
    });
    readableRecv.pipeThrough(decryptStream).pipeTo(writableRecv);
  }
}