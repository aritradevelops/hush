import { useEffect } from 'react'
import { UUID } from 'crypto'
import { Socket } from 'socket.io-client'
import { Peer } from '@/lib/webrtc/peer'
import { SocketServerEmittedEvent, SocketClientEmittedEvent } from '@/types/events'
import keysManager from '@/lib/internal/keys-manager'
import { Base64Utils } from '@/lib/base64'

interface UseSocketHandlersProps {
  socket: Socket | null
  call: any
  peersRef: React.MutableRefObject<Map<UUID, Peer>>
  userMediaRef: React.MutableRefObject<MediaStream>
  deviceMediaRef: React.MutableRefObject<MediaStream | null>
  setPeers: React.Dispatch<React.SetStateAction<Peer[]>>
  user: any
}

export const useSocketCallHandlers = ({
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
    console.debug('very important', call, user)

    const onCallJoined = async (data: { id?: UUID, polite: boolean, existing_users?: UUID[] }) => {
      if (data.id) {
        if (peersRef.current.has(data.id)) return
        console.debug(`Call: New User Joined :${data.id}`, user.id)
        const newPeer = new Peer(data.id, data.polite, socket, userMediaRef.current, deviceMediaRef.current, call, Base64Utils.encode(await keysManager.getSharedSecret(call.channel_id, user.email)))

        await newPeer.init()
        peersRef.current.set(newPeer.id, newPeer)
        setPeers(existingPeers => [...existingPeers, newPeer])
      }

      if (data.existing_users) {
        console.debug(`Call: Existing users :${data.existing_users}`)
        const newPeers: Peer[] = []

        for (const id of data.existing_users) {
          const newPeer = new Peer(id, data.polite, socket, userMediaRef.current, deviceMediaRef.current, call, Base64Utils.encode(await keysManager.getSharedSecret(call.channel_id, user.email)))
          await newPeer.init()
          newPeers.push(newPeer)
          peersRef.current.set(id, newPeer)
        }
        setPeers(newPeers)
      }
    }

    const onCallLeft = async (data: { from: UUID }) => {
      console.debug(`Call: User ${data.from} left the call`)
      if (!peersRef.current.has(data.from)) return
      const peer = peersRef.current.get(data.from)!
      peersRef.current.delete(data.from)
      peer.close()
      setPeers(peers => peers.filter(p => p.id !== peer.id))
    }

    const onSessionDescription = async (data: { description: RTCSessionDescription, from: UUID }) => {
      console.debug('received session description', data.description.type)
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

    // join call
    socket.emit(SocketClientEmittedEvent.CALL_JOIN, call)
    console.debug('Call: emitting call join')
    window.onbeforeunload = (e) => {
      // leave call
      socket.emit(SocketClientEmittedEvent.CALL_LEAVE, call)
      console.debug('Call: emitting call leave')
    }
    return () => {
      socket.off(SocketServerEmittedEvent.CALL_JOINED, onCallJoined)
      socket.off(SocketServerEmittedEvent.RTC_SESSCION_DESCRIPTION, onSessionDescription)
      socket.off(SocketServerEmittedEvent.RTC_ICE_CANDIDATE, onICECandidate)
      socket.off(SocketServerEmittedEvent.CALL_LEFT, onCallLeft)
      // leave call
      socket.emit(SocketClientEmittedEvent.CALL_LEAVE, call)
      console.debug('Call: emitting call leave')
    }
  }, [socket, call, peersRef, userMediaRef, deviceMediaRef, setPeers, user])
}