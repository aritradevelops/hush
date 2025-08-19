import { useEffect } from 'react'
import { UUID } from 'crypto'
import { Socket } from 'socket.io-client'
import { SocketServerEmittedEvent, SocketClientEmittedEvent } from '@/types/events'
import keysManager from '@/lib/internal/keys-manager'
import { Base64Utils } from '@/lib/base64'
import { PeerNew } from '@/lib/webrtc/peer-new'

interface UseSocketHandlersNewProps {
  socket: Socket | null
  call: any
  peersRef: React.MutableRefObject<Map<UUID, PeerNew>>
  userMediaRef: React.MutableRefObject<MediaStream>
  setPeers: React.Dispatch<React.SetStateAction<PeerNew[]>>
  user: any
}

export const useSocketCallHandlersNew = ({
  socket,
  call,
  peersRef,
  userMediaRef,
  setPeers,
  user,
}: UseSocketHandlersNewProps) => {
  useEffect(() => {
    if (!socket || !call) return

    const onCallJoined = async (data: { id?: UUID; polite: boolean; existing_users?: UUID[] }) => {
      if (data.id) {
        if (peersRef.current.has(data.id)) return
        const newPeer = new PeerNew(
          data.id,
          data.polite,
          socket,
          userMediaRef.current,
          null,
          call,
          Base64Utils.encode(await keysManager.getSharedSecret(call.channel_id, user.email))
        )
        await newPeer.init()
        peersRef.current.set(newPeer.id, newPeer)
        setPeers((existing) => [...existing, newPeer])
      }

      if (data.existing_users) {
        const newPeers: PeerNew[] = []
        for (const id of data.existing_users) {
          const newPeer = new PeerNew(
            id,
            data.polite,
            socket,
            userMediaRef.current,
            null,
            call,
            Base64Utils.encode(await keysManager.getSharedSecret(call.channel_id, user.email))
          )
          await newPeer.init()
          newPeers.push(newPeer)
          peersRef.current.set(id, newPeer)
        }
        setPeers(newPeers)
      }
    }

    const onCallLeft = async (data: { from: UUID }) => {
      if (!peersRef.current.has(data.from)) return
      const peer = peersRef.current.get(data.from)!
      peersRef.current.delete(data.from)
      peer.close()
      setPeers((peers) => peers.filter((p) => p.id !== peer.id))
    }

    const onSessionDescription = async (data: { description: RTCSessionDescription; from: UUID }) => {
      const peer = peersRef.current.get(data.from)
      if (!peer) return
      await peer.handleSessionDescription(data.description)
    }

    const onICECandidate = async (data: { candidate: RTCIceCandidate; from: UUID }) => {
      const peer = peersRef.current.get(data.from)
      if (!peer) return
      await peer.handleICECandidate(data.candidate)
    }

    socket.on(SocketServerEmittedEvent.CALL_JOINED, onCallJoined)
    socket.on(SocketServerEmittedEvent.CALL_LEFT, onCallLeft)
    socket.on(SocketServerEmittedEvent.RTC_SESSCION_DESCRIPTION, onSessionDescription)
    socket.on(SocketServerEmittedEvent.RTC_ICE_CANDIDATE, onICECandidate)

    socket.emit(SocketClientEmittedEvent.CALL_JOIN, call)

    window.onbeforeunload = () => {
      socket.emit(SocketClientEmittedEvent.CALL_LEAVE, call)
    }
    return () => {
      socket.off(SocketServerEmittedEvent.CALL_JOINED, onCallJoined)
      socket.off(SocketServerEmittedEvent.RTC_SESSCION_DESCRIPTION, onSessionDescription)
      socket.off(SocketServerEmittedEvent.RTC_ICE_CANDIDATE, onICECandidate)
      socket.off(SocketServerEmittedEvent.CALL_LEFT, onCallLeft)
      socket.emit(SocketClientEmittedEvent.CALL_LEAVE, call)
    }
  }, [socket, call, peersRef, userMediaRef, setPeers, user])
}


