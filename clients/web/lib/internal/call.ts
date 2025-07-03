// import { Socket } from "socket.io-client";
// import { RTC_CONFIG } from "@/config/webrtc"

// export class Call {
//   private callees = new Map<string, Callee>()
//   private caller!: Caller
//   constructor(public readonly id: string, private socket: Socket) {
//     this.socket.on("rtc:icecandidate", this.handleICECandidate)
//   }
//   private async handleICECandidate({ from, candidate }: { from: string, candidate: RTCIceCandidate }) {
//     const callee = this.callees.get(from)
//     if (!callee) return
//     console.log(`WebRTC: New ICE candidate received for ${callee.id}`)
//     await callee.addIceCandidate(candidate)
//   }

//   async join(caller: Caller) {
//     this.caller = caller
//     this.socket.emit("call:joined", { id: caller.id })
//   }

//   start(caller: Caller) {
//     this.caller = caller
//     this.socket.emit("call:started", { id: this.id })
//   }
//   leave() {

//   }
//   end() {

//   }
// }



// /** Callee represents a remote peer in the call */
// export class Callee extends RTCPeerConnection {
//   userMediaStream: MediaStream
//   constructor(
//     public readonly id: string,
//     public isMuted: boolean,
//     public isVideoOff: boolean,
//     private socket: Socket,
//   ) {
//     super(RTC_CONFIG)
//     this.userMediaStream = new MediaStream()
//     this.addEventListener("icecandidate", e => {
//       if (e.candidate) {
//         console.log(`WebRTC: New ICE canidate found for peer : ${this.id}`)
//         this.socket.emit("rtc:icecandidate", { candidate: e.candidate })
//       }
//     })
//     this.addEventListener("track", e => {
//       console.log(`WebRTC: New TRACK added to peer : ${this.id}`)
//       this.addTrack(e.track, this.userMediaStream)
//     })
//   }
//   /** dial creates a new offer and sends it to the callee */
//   async dial() {
//     const offer = await this.createOffer()
//     await this.setLocalDescription(offer)
//     console.log(`WebRTC: New OFFER created from peer : ${this.id}`)
//     this.socket.emit("rtc:offer", { offer })
//   }
//   /** pickUp accepts an offer and sends an answer to the callee */
//   async pickUp(offer: RTCSessionDescription) {
//     console.log(`WebRTC: New OFFER recieved for peer : ${this.id}`)
//     await this.setRemoteDescription(offer)
//     const answer = await this.createAnswer(offer)
//     console.log(`WebRTC: New ANSWER created from peer : ${this.id}`)
//     this.socket.emit("rtc:answer", { answer })
//   }
//   /** accept accepts an answer and establishes the connection */
//   async accept(answer: RTCSessionDescription) {
//     console.log(`WebRTC: New ANSWER recieved for peer : ${this.id}`)
//     await this.setRemoteDescription(answer)
//   }

//   /** hangUp closes the connection and stops the tracks */
//   hangUp() {
//     console.log(`WebRTC: Closing remote peer : ${this.id}`)
//     this.close()
//     this.userMediaStream.getTracks().forEach(t => t.stop())
//   }
// }

// /** Caller represents the local peer in a call */
// export class Caller {
//   private userMedia!: MediaStream
//   private deviceMedia?: MediaStream
//   constructor(
//     public readonly id: string,
//     public isMuted: boolean,
//     public isVideoOff: boolean,
//     private socket: Socket
//   ) { }

//   async getDevices() {
//     const devices = await navigator.mediaDevices.enumerateDevices()
//     const audioInputs: MediaDeviceInfo[] = []
//     const videoInputs: MediaDeviceInfo[] = []
//     const audioOutputs: MediaDeviceInfo[] = []
//     let hasMic = false, hasCamera = false, hasPermission = false
//     for (const device of devices) {
//       hasPermission = true
//       switch (device.kind) {
//         case 'audioinput': {
//           hasMic = true
//           audioInputs.push(device)
//           break
//         }
//         case 'videoinput': {
//           hasCamera = true
//           videoInputs.push(device)
//           break
//         }
//         case 'audiooutput': {
//           audioOutputs.push(device)
//           break
//         }
//       }
//     }
//     return {
//       hasCamera,
//       hasMic,
//       hasPermission,
//       audioInputs,
//       audioOutputs,
//       videoInputs
//     }
//   }
//   async init() {
//     this.userMedia = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
//     if (this.isMuted) this.userMedia.getAudioTracks().forEach(t => t.enabled = false)
//     if (this.isVideoOff) this.userMedia.getVideoTracks().forEach(t => t.enabled = false)
//   }

//   mute() {
//     this.userMedia.getAudioTracks().forEach(t => t.kind === 'audio' && (t.enabled = false))
//     this.isMuted = true
//   }
//   unmute() {
//     this.userMedia.getAudioTracks().forEach(t => t.kind === 'audio' && (t.enabled = true))
//     this.isMuted = false
//   }

//   turnOffVideo() {
//     this.userMedia.getAudioTracks().forEach(t => t.kind === 'audio' && (t.enabled = false))
//     this.isVideoOff = true
//   }
//   turnOnVideo() {
//     this.userMedia.getAudioTracks().forEach(t => t.kind === 'audio' && (t.enabled = true))
//     this.isVideoOff = false
//   }

//   getUserMedia() {
//     return this.userMedia
//   }

//   getDeviceMedia() {
//     return this.deviceMedia
//   }
// }