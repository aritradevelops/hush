'use client'
import { useSocket } from "@/contexts/socket-context";
import { useMe } from "@/contexts/user-context";
import { Base64Utils } from "@/lib/base64";
import keysManager from "@/lib/internal/keys-manager";
import { Peer } from "@/lib/internal/webrtc/peer";
import { PeerManager } from "@/lib/internal/webrtc/peer-manager";
import { Call } from "@/types/entities";
import { SocketClientEmittedEvent, SocketServerEmittedEvent } from "@/types/events";
import { UUID } from "crypto";
import { createContext, useContext, useEffect, useRef, useState } from "react";

export type CallStatus = 'none' | 'ringing' | 'ongoing'
export interface CallContextInterface {
  call: Call | null
  callStatus: CallStatus
  userMedia: MediaStream | null
  callError: string | null
  isAudioOn: boolean
  isVideoOn: boolean
  peers: Peer[]
  showIncomingCallModal: boolean
  toggleMic: () => void
  toggleCamera: () => void
  startCall: (channelId: string, channelType: 'dm' | 'group') => Promise<void>
  joinCall: () => Promise<void>
  closeIncomingCallModal: () => void
}


const CallContext = createContext<CallContextInterface | undefined>(undefined)

export const CallContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [call, setCall] = useState<Call | null>(null)
  const channelIdRef = useRef<UUID | null>(null)
  const [callStatus, setCallStatus] = useState<CallStatus>('none')
  const [userMedia, setUserMedia] = useState<MediaStream | null>(null)
  const [callError, setCallError] = useState<string | null>(null)
  const [isAudioOn, setIsAudioOn] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(false)
  const [showIncomingCallModal, setShowIncomingCallModal] = useState(false)
  const peersRef = useRef(new Map<string, Peer>())
  const [peers, setPeers] = useState<Peer[]>([])
  const { socket } = useSocket()
  const userCallSettings = { audio: true, video: false }
  const peerManagerRef = useRef<PeerManager | null>(null)
  const { user } = useMe()
  const counter = "ydBoaNtNQO4Mkuby5Q702Q=="
  useEffect(() => {
    if (socket && userMedia && !peerManagerRef.current) {
      peerManagerRef.current = new PeerManager(socket, userMedia)
    }
  }, [socket, userMedia])
  const createPeer = async (id: string) => {
    if (!userMedia || !socket) return null
    if (!channelIdRef.current) return
    const sharedSecret = await keysManager.getSharedSecret(channelIdRef.current, user.email)
    const peer = new Peer(id, socket, userMedia, Base64Utils.encode(sharedSecret), counter)
    peersRef.current.set(id, peer)
    setPeers((prev) => [...prev, peer])
    return peer
  }

  const startCall = async (channelId: string, channelType: 'dm' | 'group') => {
    try {
      if (!socket) return
      channelIdRef.current = channelId as UUID
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      stream.getAudioTracks().forEach(t => (t.enabled = userCallSettings.audio))
      stream.getVideoTracks().forEach(t => (t.enabled = userCallSettings.video))

      setIsAudioOn(userCallSettings.audio)
      setIsVideoOn(userCallSettings.video)
      setUserMedia(stream)

      socket.emit(SocketClientEmittedEvent.CALL_STARTED, { channel_id: channelId, channel_type: channelType }, (data: Call) => {
        setCall(data)
        setCallStatus('ongoing')
      })
    } catch (err) {
      setCallError(String(err))
    }
  }

  const joinCall = async () => {
    try {
      if (!socket) return
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      stream.getAudioTracks().forEach(t => (t.enabled = userCallSettings.audio))
      stream.getVideoTracks().forEach(t => (t.enabled = userCallSettings.video))

      setIsAudioOn(userCallSettings.audio)
      setIsVideoOn(userCallSettings.video)
      setUserMedia(stream)
      socket.emit(SocketClientEmittedEvent.CALL_JOINED, call)
      setCallStatus('ongoing')
    } catch (err) {
      setCallError(String(err))
    }
  }

  const toggleMic = () => {
    userMedia?.getAudioTracks().forEach(t => (t.enabled = !t.enabled))
    setIsAudioOn(prev => !prev)
  }

  const toggleCamera = () => {
    userMedia?.getVideoTracks().forEach(t => (t.enabled = !t.enabled))
    setIsVideoOn(prev => !prev)
  }

  const closeIncomingCallModal = () => setShowIncomingCallModal(false)

  useEffect(() => {
    peers.forEach(p => peersRef.current.set(p.id, p))
  }, [peers])

  useEffect(() => {
    if (!socket) return

    const onCallStarted = (data: Call & { from: string }) => {
      setCall(data)
      setCallStatus('ringing')
      setShowIncomingCallModal(true)
    }

    const onCallJoined = async ({ from, channel_id }: { channel_id: string; from: string }) => {
      if (peersRef.current.has(from) || !userMedia) return
      channelIdRef.current = channel_id as UUID
      const peer = await createPeer(from)
      if (!peer) return
      const offer = await peer.createOffer()
      console.log('creating offer')
      await peer.setLocalDescription(offer)
      socket.emit(SocketClientEmittedEvent.RTC_OFFER, { offer, to: from })
    }

    const onOffer = async ({ offer, from }: { offer: RTCSessionDescriptionInit; from: string }) => {
      if (!userMedia) return
      let peer = peersRef.current.get(from) || await createPeer(from)
      if (!peer || peer.signalingState !== 'stable') return
      await peer.setRemoteDescription(offer)
      const answer = await peer.createAnswer()
      console.log('creating answer')
      await peer.setLocalDescription(answer)
      socket.emit(SocketClientEmittedEvent.RTC_ANSWER, { answer, to: from })
    }

    const onAnswer = async ({ answer, from }: { answer: RTCSessionDescriptionInit; from: string }) => {
      const peer = peersRef.current.get(from)
      if (!peer || peer.signalingState !== 'have-local-offer') return
      console.log('setting local description')
      await peer.setRemoteDescription(answer)
    }

    const onIceCandidate = ({ candidate, from }: { candidate: RTCIceCandidate; from: string }) => {
      const peer = peersRef.current.get(from)
      console.log('received ice candidate')
      if (peer) peer.addIceCandidate(candidate)
    }

    socket.on(SocketServerEmittedEvent.CALL_STARTED, onCallStarted)
    socket.on(SocketServerEmittedEvent.CALL_JOINED, onCallJoined)
    socket.on(SocketServerEmittedEvent.RTC_OFFER, onOffer)
    socket.on(SocketServerEmittedEvent.RTC_ANSWER, onAnswer)
    socket.on(SocketServerEmittedEvent.RTC_ICE_CANDIDATE, onIceCandidate)

    return () => {
      socket.off(SocketServerEmittedEvent.CALL_STARTED, onCallStarted)
      socket.off(SocketServerEmittedEvent.CALL_JOINED, onCallJoined)
      socket.off(SocketServerEmittedEvent.RTC_OFFER, onOffer)
      socket.off(SocketServerEmittedEvent.RTC_ANSWER, onAnswer)
      socket.off(SocketServerEmittedEvent.RTC_ICE_CANDIDATE, onIceCandidate)
    }
  }, [socket, userMedia])

  return (
    <CallContext.Provider
      value={{
        callStatus,
        callError,
        call,
        isAudioOn,
        isVideoOn,
        startCall,
        userMedia,
        peers,
        toggleCamera,
        toggleMic,
        joinCall,
        closeIncomingCallModal,
        showIncomingCallModal
      }}>
      {children}
    </CallContext.Provider>
  )
}

export const useCall = () => {
  const ctx = useContext(CallContext)
  if (!ctx) throw new Error('`useCall` must be used within `CallContextProvider`')
  return ctx
}
