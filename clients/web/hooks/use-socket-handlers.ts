import { useEffect } from 'react'
import { UUID } from 'crypto'
import { Socket } from 'socket.io-client'
import { Peer } from '@/lib/webrtc/peer'
import { SocketServerEmittedEvent, SocketClientEmittedEvent } from '@/types/events'

interface UseSocketHandlersProps {
  socket: Socket | null
  call: any
  peersRef: React.MutableRefObject<Map<UUID, Peer>>
  userMediaRef: React.MutableRefObject<MediaStream>
  deviceMediaRef: React.MutableRefObject<MediaStream | null>
  setPeers: React.Dispatch<React.SetStateAction<Peer[]>>
  user: any
}

export const useSocketHandlers = ({
  socket,
  call,
  peersRef,
  userMediaRef,
  deviceMediaRef,
  setPeers,
  user
}: UseSocketHandlersProps) => {
  useEffect(() => {
    if (!socket || !call) return

    const onCallJoined = async (data: { id?: UUID, polite: boolean, existing_users?: UUID[] }) => {
      if (data.id) {
        if (peersRef.current.has(data.id)) return
        console.log(`Call: New User Joined :${data.id}`, user.id)
        const newPeer = new Peer(data.id, data.polite, socket, userMediaRef.current, deviceMediaRef.current)

        await newPeer.init()
        peersRef.current.set(newPeer.id, newPeer)
        setPeers(existingPeers => [...existingPeers, newPeer])
      }

      if (data.existing_users) {
        console.log(`Call: Existing users :${data.existing_users}`)
        const newPeers: Peer[] = []

        for (const id of data.existing_users) {
          const newPeer = new Peer(id, data.polite, socket, userMediaRef.current, deviceMediaRef.current)
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
      console.log('received session description', data.description.type)
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
  }, [socket, call, peersRef, userMediaRef, deviceMediaRef, setPeers, user])
}