'use client'
import { constants } from "@/config/constants";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
const socket = io(constants.SERVER_URL, {
  withCredentials: true,
});
const iceServerConfig: RTCConfiguration = {
  iceServers: [
    { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }
  ]
}
interface ICallContext {
  readonly peers: [string, RTCPeerConnection, MediaStream][]
}
const CallContext = createContext<ICallContext | undefined>(undefined)

const CallContextProvider = function ({ children }: { children: React.ReactNode }) {
  const [peers, setPeers] = useState<[string, RTCPeerConnection, MediaStream][]>([])
  const newPeer = async (id: string, s: Socket) => {
    console.log("new peer joined ", id)
    if (peers.find(([i]) => i === id)) return
    const peer = new RTCPeerConnection(iceServerConfig)
    const stream = new MediaStream()
    setPeers(p => [...p, [id, peer, stream]])
    peer.addEventListener('icecandidate', e => {
      console.log(`New ice candidate for peer: ${id} : `, e.candidate)
      peer.addIceCandidate(e.candidate)
      s.emit("relay", { candidate: e.candidate, type: 'ice:candidate' })
    })
    peer.addEventListener('iceconnectionstatechange', e => {
      console.log(`ice candidate state change for peer: ${id} : `, e)
    })
    peer.addEventListener('track', e => {
      console.log(`New ice track for peer: ${id} : `, e.track)
      stream.addTrack(e.track)
    })
    const offer = await peer.createOffer()
    await peer.setLocalDescription(offer)
    console.log("sending offer to connect", offer)
    s.emit("relay", { offer, type: "ice:offer" })
    console.log("setting peer")
  }
  useEffect(() => {
    if (!socket) return
    const handleRelayEvent = (data: { type: 'call:joined' | 'ice:candidate' | 'ice:offer' | 'ice:answer' } & any) => {
      switch (data.type) {
        case 'call:joined': {
          newPeer(data.from, socket)
          break
        }
        case 'call:left': {
          const idx = peers.findIndex(w => w[0] === data.from)!
          peers[idx][1].close()
          setPeers(p => [...p.slice(0, idx), ...p.slice(idx + 1, p.length)])
          break
        }
        case 'ice:candidate': {
          (async ({ from, candidate }: { from: string, candidate: RTCIceCandidate }) => {
            peers.find(([id]) => id === from)?.[1].addIceCandidate(candidate)
          })(data)
          break
        }
        case 'ice:offer': {
          console.log("offer received");
          (async ({ from, offer }: { from: string, offer: RTCSessionDescriptionInit }) => {

            const peer = new RTCPeerConnection(iceServerConfig)
            const stream = new MediaStream()
            peer.addEventListener('icecandidate', e => {
              console.log(`New ice candidate for peer: ${from} : `, e.candidate)
              peer.addIceCandidate(e.candidate)
              socket.emit("relay", { candidate: e.candidate, type: 'ice:candidate' })
            })
            peer.addEventListener('iceconnectionstatechange', e => {
              console.log(`ice candidate state change for peer: ${from} : `, e)
            })
            peer.addEventListener('track', e => {
              console.log(`New ice track for peer: ${from} : `, e.track)
              stream.addTrack(e.track)
            })
            await peer.setRemoteDescription(offer)
            const answer = await peer.createAnswer()
            await peer.setLocalDescription(answer)
            console.log("sending answer")
            socket.emit("relay", { answer, type: 'ice:answer' })
            setPeers(p => [...p, [from, peer, stream]])
          })(data)
          break
        }
        case 'ice:answer': {
          (async ({ from, answer }: { from: string, answer: RTCSessionDescriptionInit }) => {
            console.log("received answer from: ", from)
            console.log("peers", peers)
            const target = peers.find(p => p[0] === from)?.[1]
            if (!target) return
            console.log("setting answer:")
            await target.setRemoteDescription(answer)
          })(data)
          break
        }
        default: {
          console.error('wrong event type', data)
        }
      }
    }

    socket.on("relay", handleRelayEvent)
    return () => {
      socket.emit("relay", { type: "call:left" })
      socket.off("relay", handleRelayEvent)
    }
  }, [])
  return <CallContext.Provider value={{ peers }}>
    {children}
  </CallContext.Provider>
}

export default function Page() {
  return (
    <CallContextProvider >
      <Conference />
    </CallContextProvider>
  )
}

function Conference() {
  const { peers } = useContext(CallContext)!
  const localVideoRef = useRef<HTMLVideoElement>(null)
  console.log('re-rendering')
  useEffect(() => {
    if (!socket) return
    navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(s => {
      peers.forEach(([_, p]) => {
        s.getTracks().forEach(t => p.addTrack(t))
      })
      if (localVideoRef.current) {
        console.log('setting local stream', s)
        localVideoRef.current.srcObject = s
      }
    }).catch(console.error)
    socket.emit("relay", { type: 'call:joined' })
  }, [])
  return (<div className="w-full h-screen flex justify-center items-center">
    <div className="w-[480px] h-auto border-2 border-white rounded-md" key={socket.id}>
      <video ref={localVideoRef} className="rotate-y-180" autoPlay></video>
    </div>
    {peers.map(([id, _, s]) => {
      console.log(id)
      return (
        <div className="w-[480px] h-auto border-2 border-white rounded-md" key={id} id={id}>
          <video className="object-contain" ref={(r) => {
            if (r) r.srcObject = s
          }} autoPlay playsInline></video>
        </div>
      )
    })}
  </div>)
}