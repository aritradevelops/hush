import React, { useEffect, useRef, useState } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { User } from '@/types/entities'
import httpClient from '@/lib/http-client'
import { PeerNew } from '@/lib/webrtc/peer-new'

interface PeerVideoNewProps {
  peer: PeerNew
}

export const PeerVideoNew: React.FC<PeerVideoNewProps> = ({ peer }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAudioOff, setIsAudioOff] = useState(true)
  const [isVideoOff, setIsVideoOff] = useState(true)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const screenRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    httpClient.listContacts({ where_clause: { user_id: { $eq: peer.id } } }).then(r => {
      if (r.data[0]) {
        setUser({ ...r.data[0].user, name: r.data[0].nickname })
      }
    })

    peer.onRemoteCameraChange((s) => setIsVideoOff(s === 'muted'))
    peer.onRemoteMicChange((s) => setIsAudioOff(s === 'muted'))
  }, [peer])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = peer.RemoteUserStream
    }
    if (screenRef.current && peer.RemoteScreenStream) {
      screenRef.current.srcObject = peer.RemoteScreenStream
    }
  })

  if (!user) {
    return (
      <div className="relative flex justify-center items-center rounded-xl bg-gray-800 w-full h-full min-h-0 overflow-hidden aspect-video">
        <div className="text-white text-sm">connecting...</div>
      </div>
    )
  }

  return (
    <div className="relative flex justify-center items-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 w-full h-full min-h-0 overflow-hidden aspect-video">
      <div className='absolute w-8 h-8 sm:w-10 sm:h-10 top-2 right-2 bg-black/50 rounded-md flex justify-center items-center z-10'>
        {isAudioOff ? <MicOff size={16} className="text-white" /> : <Mic size={16} className="text-white" />}
      </div>

      <div className='absolute bottom-2 left-2 bg-black/50 rounded-md px-2 py-1 z-10'>
        <span className="text-white text-xs sm:text-sm font-medium">{user.name}</span>
      </div>

      {isVideoOff ? (
        <img
          src={user.dp || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
          alt={user.name}
          className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <video ref={videoRef} playsInline autoPlay className="w-full h-full object-contain" />
      )}

      {peer.RemoteScreenStream && (
        <video ref={screenRef} playsInline autoPlay className="absolute bottom-4 right-4 w-1/4 h-1/4 object-contain rounded-md border border-white/20" />
      )}
    </div>
  )
}


