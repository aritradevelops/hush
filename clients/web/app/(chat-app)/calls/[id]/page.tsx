'use client'
import { useSocket } from '@/contexts/socket-context'
import { useMe } from '@/contexts/user-context'
import { useMediaDevices } from '@/hooks/use-media-devices'
import httpClient from '@/lib/http-client'
import { cn } from '@/lib/utils'
import { Peer } from '@/lib/webrtc/peer'
import { User } from '@/types/entities'
import { SocketClientEmittedEvent, SocketServerEmittedEvent } from '@/types/events'
import { ReactQueryKeys } from '@/types/react-query'
import { useQuery } from '@tanstack/react-query'
import { UUID } from 'crypto'
import { Camera, CameraOff, Mic, MicOff, PhoneOff, ScreenShare, ScreenShareIcon } from 'lucide-react'
import { useParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

const CallPage = () => {
  const params = useParams()
  const callId = params.id as UUID
  const { socket } = useSocket()
  const { data: call, isLoading: isCallLoading } = useQuery({
    queryKey: [ReactQueryKeys.CALL_DETAILS, callId],
    queryFn: () => httpClient.getCallDetails(callId as UUID),
    select: (data) => data.data
  })
  const { devices, permissions, loading, error, refresh } = useMediaDevices()
  // user video states
  const [isMuted, setIsMuted] = useState(true)
  const [isVideoOff, setIsVideoOff] = useState(true)
  const peersRef = useRef(new Map<UUID, Peer>())
  const userMediaRef = useRef(new MediaStream())
  const deviceMediaRef = useRef<MediaStream | null>(null)
  const [peers, setPeers] = useState<Peer[]>([])
  const { user } = useMe()
  // init
  useEffect(() => {
    if (!socket || !call) return
    const onCallJoined = async (data: { id?: UUID, polite: boolean, existing_users?: UUID[] }) => {
      if (data.id) {
        if (peersRef.current.has(data.id)) return
        console.log(`Call: New User Joined :${data.id}`, user.id)
        const newPeer = new Peer(data.id, data.polite, socket, userMediaRef.current, deviceMediaRef.current)

        // Initialize the peer before adding to map
        await newPeer.init()

        peersRef.current.set(newPeer.id, newPeer)
        setPeers(existingPeers => [...existingPeers, newPeer])
      }

      if (data.existing_users) {
        console.log(`Call: Existing users :${data.existing_users}`)
        const newPeers: Peer[] = []

        for (const id of data.existing_users) {
          const newPeer = new Peer(id, data.polite, socket, userMediaRef.current, deviceMediaRef.current)

          // Initialize each peer
          await newPeer.init()

          newPeers.push(newPeer)
          peersRef.current.set(id, newPeer)
        }
        setPeers(newPeers)
      }
    }
    const onCallLeft = async (data: { from: UUID }) => {
      console.log(`Call: User ${data.from} left the call`)
      if (!peersRef.current.has(data.from)) return
      const peer = peersRef.current.get(data.from)!
      peer.close()
      setPeers(peers => peers.filter(p => p.id !== peer.id))
    }

    const onSessionDescription = async (data: { description: RTCSessionDescription, from: UUID }) => {
      console.log('recieved session description', data.description.type)
      const peer = peersRef.current.get(data.from)
      if (!peer) {
        console.warn(`Peer ${data.from} not found!`)
        return
      }
      await peer.handleSessionDescription(data.description)
    }
    const onICECandidate = async (data: { candidate: RTCIceCandidate, from: UUID }) => {
      const peer = peersRef.current.get(data.from)
      if (!peer) {
        console.warn(`Peer ${data.from} not found!`)
        return
      }
      await peer.handleICECandidate(data.candidate)
    }

    socket.on(SocketServerEmittedEvent.CALL_JOINED, onCallJoined)
    socket.on(SocketServerEmittedEvent.CALL_LEFT, onCallLeft)
    socket.on(SocketServerEmittedEvent.RTC_SESSCION_DESCRIPTION, onSessionDescription)
    socket.on(SocketServerEmittedEvent.RTC_ICE_CANDIDATE, onICECandidate)


    socket.emit(SocketClientEmittedEvent.CALL_JOIN, call)
    console.log('Call: emitting call join')

    return () => {
      socket.off(SocketServerEmittedEvent.CALL_JOINED, onCallJoined)
      socket.off(SocketServerEmittedEvent.RTC_SESSCION_DESCRIPTION, onSessionDescription)
      socket.off(SocketServerEmittedEvent.RTC_ICE_CANDIDATE, onICECandidate)
      socket.off(SocketServerEmittedEvent.CALL_LEFT, onCallLeft)
      socket.emit(SocketClientEmittedEvent.CALL_LEAVE, call)
      console.log('Call: emitting call leave')
    }
  }, [socket, call])

  const toggleCamera = async () => {
    if (isVideoOff) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false // Don't request audio if we're just toggling video
        })

        const videoTrack = stream.getVideoTracks()[0]
        if (videoTrack) {
          // Add track to local stream
          userMediaRef.current.addTrack(videoTrack)

          // Add track to all peers
          for (const peer of peersRef.current.values()) {
            await peer.addTrack(videoTrack, 'user')
          }

          setIsVideoOff(false)
        }
      } catch (error) {
        console.error('Error enabling camera:', error)
      }
    } else {
      // Turn off video
      const videoTracks = userMediaRef.current.getVideoTracks()

      for (const track of videoTracks) {
        // Remove from all peers first
        for (const peer of peersRef.current.values()) {
          await peer.removeTrack(track)
        }

        // Stop and remove from local stream
        track.stop()
        userMediaRef.current.removeTrack(track)
      }

      setIsVideoOff(true)
    }
  }
  const toggleMicrophone = async () => {
    if (isMuted) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true
        })

        const audioTrack = stream.getAudioTracks()[0]
        if (audioTrack) {
          // Add track to local stream
          userMediaRef.current.addTrack(audioTrack)

          // Add track to all peers
          for (const peer of peersRef.current.values()) {
            await peer.addTrack(audioTrack, 'user')
          }

          setIsMuted(false)
        }
      } catch (error) {
        console.error('Error enabling microphone:', error)
      }
    } else {
      // Mute audio
      const audioTracks = userMediaRef.current.getAudioTracks()

      for (const track of audioTracks) {
        // Remove from all peers first
        for (const peer of peersRef.current.values()) {
          await peer.removeTrack(track)
        }

        // Stop and remove from local stream
        track.stop()
        userMediaRef.current.removeTrack(track)
      }

      setIsMuted(true)
    }
  }


  if (isCallLoading || loading) return <CallConnecting />
  if (!isCallLoading && !call) return <CallNotFound />
  if (call && call.ended_at) return <CallEnded />

  const getGridRows = () => {
    if (peers.length === 0) return 'grid-rows-1'
    if (peers.length === 1) return 'grid-rows-2'
  }
  const getGridCols = () => {
    if (peers.length === 0) return 'grid-cols-1'
    if (peers.length === 1) return 'grid-cols-1'
  }

  return (
    <div className={cn('flex flex-col w-full h-full gap-2 p-5 justify-center items-center', getGridCols(), getGridRows())}>
      <div className='h-full w-full grid gap-2'>
        {isVideoOff ? <div className="flex justify-center items-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 aspect-video max-h-[40%]">
          <img
            src={user.dp || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
            alt={user.name}
            className="w-24 h-24 rounded-full"
          />
        </div> :
          <div className="flex justify-center items-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 aspect-video max-h-[40%]">
            <video
              ref={
                (r) => {
                  if (r) {
                    r.srcObject = userMediaRef.current
                  }
                }
              }
              playsInline
              autoPlay
            />
          </div>}
        {peers.map(p =>
          <PeerView peer={p} key={p.id} />
        )}
      </div>
      {/* Options */}
      <div className='flex justify-center items-center w-full h-16 gap-x-3'>
        {/* microphone */}
        <div className='h-12 w-12 rounded-md flex justify-center items-center bg-indigo-700 cursor-pointer' onClick={toggleMicrophone}>
          {isMuted ? <MicOff /> : <Mic />}
        </div>

        <div className='h-12 w-12 rounded-md flex justify-center items-center bg-cyan-800 cursor-pointer' onClick={toggleCamera}>
          {isVideoOff ? <CameraOff /> : <Camera />}
        </div>

        {/* screen share */}
        <div className='h-12 w-12 rounded-md flex justify-center items-center bg-blue-500 cursor-pointer' /* onClick={() => {
          setIsVideoOff(prev => !prev)
        }} */>
          <ScreenShare />
        </div>
        {/* end call */}
        <div className='h-12 w-12 rounded-md flex justify-center items-center bg-red-500 cursor-pointer' /* onClick={() => {
          setIsVideoOff(prev => !prev)
        }} */>
          <PhoneOff />
        </div>
      </div>
    </div>
  )
}

const PeerView = ({ peer }: { peer: Peer }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAudioOff, setIsAudioOff] = useState(true)
  const [isVideoOff, setIsVideoOff] = useState(true)
  useEffect(() => {
    httpClient.listContacts({ where_clause: { user_id: { $eq: peer.id } } }).then(r => {
      if (r.data[0]) {
        setUser({ ...r.data[0].user, name: r.data[0].nickname })
      }
    })
    peer.onCameraChange((s) => {
      setIsVideoOff(s === 'muted')
    })
    peer.onMicChange((s) => {
      setIsAudioOff(s === 'muted')
    })

  }, [])
  if (!user) return <div className="w-full max-h-[40%] aspect-video border border-white rounded-md relative">connecting...</div>
  return (
    <div className="relative flex justify-center items-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 aspect-video max-h-[40%]">
      <div className='absolute w-10 h-10 top-2 right-2 bg-accent rounded-md flex justify-center items-center'>{isAudioOff ? <MicOff /> : <Mic />}</div>
      {isVideoOff ? <img
        src={user.dp || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
        alt={user.name}
        className="w-24 h-24 rounded-full"
      /> : <video
        ref={
          (r) => {
            if (r) {
              r.srcObject = peer.RemoteUserMedia
            }
          }
        }
        playsInline
        autoPlay
      />}
    </div>
  )
}

export const CallConnecting = () => {
  return <div>
    connecting...
  </div>
}
export const CallNotFound = () => {
  return <div>
    call not found...
  </div>
}
export const CallEnded = () => {
  return <div>
    this call has been ended...
  </div>
}

export default CallPage