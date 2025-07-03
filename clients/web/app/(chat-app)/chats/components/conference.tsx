'use client'
import { useMe } from "@/contexts/user-context"
import { useCall } from "@/hooks/use-call"
import httpClient from "@/lib/http-client"
import { Peer } from "@/lib/internal/peer"
import { cn } from "@/lib/utils"
import { User } from "@/types/entities"
import { Camera, CameraOff, Mic, MicOff } from "lucide-react"
import { useEffect, useState } from "react"

export default function Conference() {
  const { peers, isAudioOn, isVideoOn, toggleCamera, toggleMic, joinCall, callStatus, call } = useCall()
  const { user } = useMe()

  const calculateGridCols = () => {
    if (peers.length === 0) return "grid-cols-1"
    if (peers.length === 1) return "grid-cols-2"
    if (peers.length === 2) return "grid-cols-2"
    if (peers.length === 3) return "grid-cols-2"
    if (peers.length >= 4) return "grid-cols-3"
  }
  const calculateGridRows = () => {
    if (peers.length === 0) return "grid-rows-1"
    if (peers.length === 1) return "grid-rows-2"
    if (peers.length === 2) return "grid-rows-2"
    if (peers.length === 3) return "grid-rows-2"
    if (peers.length >= 4) return "grid-rows-2"
  }

  return <div className="w-[70%] flex flex-col justify-center items-center p-5">
    {/* smart grid two accommodate peers */}
    <div className={cn("flex-1 grid gap-2", calculateGridCols(), calculateGridRows())}>
      <SelfMedia />
      {peers.map(peer =>
        <PeerMedia peer={peer} key={peer.id} />
      )}
    </div>
    <div className="w-full flex gap-2 justify-center items-center h-20 align-baseline">
      <div className="w-13 h-13 rounded-md flex cursor-pointer bg-gray-700 justify-center items-center">{
        isAudioOn
          ? <Mic className="w-8 h-8 text-green-500" onClick={toggleMic}></Mic>
          : <MicOff className="w-8 h-8 text-red-500" onClick={toggleMic}></MicOff>
      }</div>
      <div className="w-13 h-13 rounded-md flex cursor-pointer bg-gray-700 justify-center items-center">{
        isVideoOn
          ? <Camera className="w-8 h-8 text-green-500" onClick={toggleCamera}></Camera>
          : <CameraOff className="w-8 h-8 text-red-500" onClick={toggleCamera}></CameraOff>
      }</div>
    </div>
  </div>
}

function SelfMedia() {
  const { userMedia, isAudioOn, isVideoOn, peers } = useCall()
  const { user } = useMe()
  if (!userMedia) return <div className="h-full aspect-video border border-white rounded-md relative">{user.email} connecting...</div>
  return <div className="w-full max-w-full max-h-fit aspect-video border border-white rounded-md relative">
    {
      !isVideoOn ? (<div className="flex h-full w-full justify-center items-center">
        <img
          src={user.dp || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
          alt={user.name}
          className="w-20 h-20 rounded-full border-4"
        />
      </div>) : (<video ref={(r) => {
        if (r) {
          r.srcObject = userMedia
        }
      }} className="w-full h-full object-contain rotate-y-180" autoPlay playsInline></video>)
    }
  </div>
}
function PeerMedia({ peer }: { peer: Peer }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    httpClient.listContacts({ where_clause: { user_id: { $eq: peer.id } } }).then(r => {
      if (r.data[0]) {
        setUser({ ...r.data[0].user, name: r.data[0].nickname })
      }
    })
  }, [])

  if (!peer.remoteUserMedia || !user) return <div className="h-full aspect-video border border-white rounded-md relative">{user?.email} connecting...</div>
  console.log(peer.remoteUserMedia, peer.isVideoOn)
  peer.remoteUserMedia.getTracks().forEach(t => console.log(t.enabled))
  return <div className="h-full aspect-video border border-white rounded-md relative">
    {
      !peer.isVideoOn ? (<div className="flex h-full w-full justify-center items-center">
        <img
          src={user.dp || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
          alt={user.name}
          className="w-20 h-20 rounded-full border-4"
        />
      </div>) : (<video
        autoPlay
        playsInline
        ref={(r) => {
          if (r && peer.remoteUserMedia) {
            console.log('inside ref video')
            r.srcObject = peer.remoteUserMedia
          }
        }} className="w-full h-full object-contain rotate-y-180" />)
    }
  </div>
}
