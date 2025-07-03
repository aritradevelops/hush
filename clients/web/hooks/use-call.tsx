'use client'
import { RTC_CONFIG } from "@/config/webrtc";
import { useSocket } from "@/contexts/socket-context";
// import { Peer } from "@/lib/internal/peer";
import { Call } from "@/types/entities";
import { SocketClientEmittedEvent, SocketServerEmittedEvent } from "@/types/events";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

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

export class Peer extends RTCPeerConnection {
  remoteUserMedia = new MediaStream()
  isVideoOn = true
  isAudioOn = true
  constructor(public id: string, public socket: Socket, public localUserMedia: MediaStream) {
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
    localUserMedia.getTracks().forEach(t => {
      console.log(`[WebRTC:${this.id}] Adding local track kind=${t.kind} enabled=${t.enabled}`)
      this.addTrack(t, localUserMedia)
    })
  }
}

const CallContext = createContext<CallContextInterface | undefined>(undefined)

export const CallContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [call, setCall] = useState<Call | null>(null)
  const [callStatus, setCallStatus] = useState<CallStatus>('none')
  const [userMedia, setUserMedia] = useState<MediaStream | null>(null)
  const [callError, setCallError] = useState<string | null>(null)
  const [isAudioOn, setIsAudioOn] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(false)
  const [showIncomingCallModal, setShowIncomingCallModal] = useState(false)
  const peersRef = useRef(new Map<string, Peer>())
  const [peers, setPeers] = useState<Peer[]>([])
  const { socket } = useSocket()
  // console.log('inside use call hook')
  // TODO: store and fetch from server
  const userCallSettings = { audio: true, video: false }
  const startCall = async (channelId: string, channelType: 'dm' | 'group') => {
    try {
      if (!socket) return
      console.log('WebRTC: Attempting to start call...')
      // const stream = new MediaStream()
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      if (!userCallSettings.audio) stream.getAudioTracks().forEach(t => t.enabled = false)
      if (!userCallSettings.video) stream.getVideoTracks().forEach(t => t.enabled = false)

      setIsAudioOn(userCallSettings.audio)
      setIsVideoOn(userCallSettings.video)
      setUserMedia(stream)

      socket.emit(SocketClientEmittedEvent.CALL_STARTED,
        { channel_id: channelId, channel_type: channelType },
        (data: Call) => {
          console.log('WebRTC: Call started successfully')
          setCall(data)
          setCallStatus('ongoing')
        })
    } catch (error) {
      console.error('WebRTC: Failed to start call', error)
      setCallError(String(error))
    }
  }



  const joinCall = async () => {
    try {
      if (!socket) return
      console.log('WebRTC: Attempting to join call...')
      // const stream = new MediaStream()
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      if (!userCallSettings.audio) stream.getAudioTracks().forEach(t => t.enabled = false)
      if (!userCallSettings.video) stream.getVideoTracks().forEach(t => t.enabled = false)

      setIsAudioOn(userCallSettings.audio)
      setIsVideoOn(userCallSettings.video)
      setUserMedia(stream)

      socket.emit(SocketClientEmittedEvent.CALL_JOINED, call)
      setCallStatus('ongoing')
      console.log('WebRTC: Joined call and notified peers')
    } catch (error) {
      console.error('WebRTC: Failed to join call', error)
      setCallError(String(error))
    }
  }

  const toggleMic = () => {
    if (!userMedia) return
    userMedia.getAudioTracks().forEach(t => t.enabled = !t.enabled)
    setIsAudioOn(p => !p)
  }
  const toggleCamera = () => {
    if (!userMedia) return
    userMedia.getVideoTracks().forEach(t => t.enabled = !t.enabled)
    setIsVideoOn(p => !p)
  }

  const closeIncomingCallModal = () => {
    setShowIncomingCallModal(false)
  }

  // an use effect to sync peers with ref
  useEffect(() => {
    for (const p of peers) {
      peersRef.current.set(p.id, p)
    }
  }, [peers])


  useEffect(() => {
    if (!socket) return
    console.log('inside use effect')
    // listen for call events and react
    const onCallStarted = async (data: Call & { from: string }) => {
      console.log('WebRTC: Incoming call from', data.from)
      try {
        setCall(data)
        setCallStatus('ringing')
        setShowIncomingCallModal(true)
      } catch (error) {
        console.error('WebRTC: Error handling CALL_STARTED', error)
        setCallError(String(error))
      }
    }

    const onCallJoined = async (data: { channel_id: string, from: string }) => {
      console.log('WebRTC: Peer joined call:', data.from)

      if (peersRef.current.has(data.from) || !userMedia) {
        console.log('WebRTC: Skipping peer, already exists or no media')
        return
      }

      const peer = new Peer(data.from, socket, userMedia)
      setPeers(p => [...p, peer])
      console.log('WebRTC: Added peer and created connection', data.from)

      const offer = await peer.createOffer()
      await peer.setLocalDescription(offer)
      console.log('WebRTC: Sending RTC_OFFER to peer', data.from)
      socket.emit(SocketClientEmittedEvent.RTC_OFFER, { offer })
    }

    const onOffer = async (data: { offer: RTCSessionDescription, from: string }) => {
      console.log('WebRTC: Received RTC_OFFER from', data.from)
      if (!userMedia) return
      let peer = peersRef.current.get(data.from)
      if (!peer) {
        console.log('WebRTC: Creating peer for offer from', data.from)
        peer = new Peer(data.from, socket, userMedia)
        setPeers(p => [...p, peer!])
      }
      if (peer.remoteDescription) return
      await peer.setRemoteDescription(data.offer)
      console.log('WebRTC: Set remote description')

      const answer = await peer.createAnswer()
      await peer.setLocalDescription(answer)
      console.log('WebRTC: Sending RTC_ANSWER to', data.from)
      socket.emit(SocketClientEmittedEvent.RTC_ANSWER, { answer })
    }

    const onAnswer = async (data: { answer: RTCSessionDescription, from: string }) => {
      console.log('WebRTC: Received RTC_ANSWER from', data.from)
      if (!userMedia) return
      const peer = peersRef.current.get(data.from)
      if (!peer) return
      await peer.setRemoteDescription(data.answer)
      console.log('WebRTC: Set remote description for answer')
    }

    const onIceCandidate = (data: { candidate: RTCIceCandidate, from: string }) => {
      console.log('WebRTC: Received ICE candidate from', data.from)
      const peer = peersRef.current.get(data.from)
      if (!peer) return
      peer.addIceCandidate(data.candidate)
      console.log('WebRTC: Added ICE candidate to peer')
    }

    socket.on(SocketServerEmittedEvent.CALL_STARTED, onCallStarted)
    socket.on(SocketServerEmittedEvent.CALL_JOINED, onCallJoined)
    socket.on(SocketServerEmittedEvent.RTC_OFFER, onOffer)
    socket.on(SocketServerEmittedEvent.RTC_ANSWER, onAnswer)
    socket.on(SocketServerEmittedEvent.RTC_ICE_CANDIDATE, onIceCandidate)
    return () => {
      console.log('cleaning up listeners')
      socket.off(SocketServerEmittedEvent.CALL_STARTED, onCallStarted)
      socket.off(SocketServerEmittedEvent.CALL_JOINED, onCallJoined)
      socket.off(SocketServerEmittedEvent.RTC_OFFER, onOffer)
      socket.off(SocketServerEmittedEvent.RTC_ANSWER, onAnswer)
      socket.off(SocketServerEmittedEvent.RTC_ICE_CANDIDATE, onIceCandidate)
    }
  }, [socket, userMedia, peers])

  return <CallContext.Provider value={{
    callStatus, callError, call, isAudioOn, isVideoOn, startCall,
    userMedia, peers, toggleCamera, toggleMic, joinCall, closeIncomingCallModal,
    showIncomingCallModal
  }}>
    {children}
  </CallContext.Provider>
}

export const useCall = () => {
  const values = useContext(CallContext)
  if (!values) throw new Error('`useCall` must be used within `CallContextProvider`')
  return values
}