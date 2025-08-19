import { useRef, useState } from 'react'
import { UUID } from 'crypto'
import { PeerNew } from '@/lib/webrtc/peer-new'

export const useCallControlsNew = () => {
  const [isMuted, setIsMuted] = useState(true)
  const [isVideoOff, setIsVideoOff] = useState(true)
  const peersRef = useRef(new Map<UUID, PeerNew>())
  const userMediaRef = useRef(new MediaStream())
  const [peers, setPeers] = useState<PeerNew[]>([])

  const toggleCamera = async () => {
    if (isVideoOff) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        const videoTrack = stream.getVideoTracks()[0]
        if (videoTrack) {
          userMediaRef.current.addTrack(videoTrack)
          for (const peer of peersRef.current.values()) {
            await peer.replaceCameraTrack(videoTrack)
          }
          setIsVideoOff(false)
        }
      } catch (error) {
        console.error('Error enabling camera:', error)
      }
    } else {
      // turn off: disable sending rather than removing track to preserve E2EE chain and renegotiation stability
      for (const peer of peersRef.current.values()) {
        await peer.cameraOff()
      }
      userMediaRef.current.getVideoTracks().forEach((t) => (t.enabled = false))
      setIsVideoOff(true)
    }
  }

  const toggleMicrophone = async () => {
    if (isMuted) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true })
        const audioTrack = stream.getAudioTracks()[0]
        if (audioTrack) {
          userMediaRef.current.addTrack(audioTrack)
          for (const peer of peersRef.current.values()) {
            await peer.replaceMicTrack(audioTrack)
            peer.unmuteMic()
          }
          setIsMuted(false)
        }
      } catch (error) {
        console.error('Error enabling microphone:', error)
      }
    } else {
      for (const peer of peersRef.current.values()) {
        peer.muteMic()
      }
      userMediaRef.current.getAudioTracks().forEach((t) => (t.enabled = false))
      setIsMuted(true)
    }
  }

  const startScreenShare = async () => {
    try {
      // @ts-ignore
      const screen = await (navigator.mediaDevices as any).getDisplayMedia({ video: true, audio: false })
      for (const peer of peersRef.current.values()) {
        await peer.startScreenShare(screen)
      }
    } catch (e) {
      console.error('Failed to start screen share', e)
    }
  }

  const stopScreenShare = () => {
    for (const peer of peersRef.current.values()) {
      peer.stopScreenShare()
    }
  }

  const switchCamera = async (deviceId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId }, audio: false })
      const track = stream.getVideoTracks()[0]
      if (!track) return
      userMediaRef.current.getVideoTracks().forEach((t) => t.stop())
      userMediaRef.current.getVideoTracks().forEach((t) => userMediaRef.current.removeTrack(t))
      userMediaRef.current.addTrack(track)
      for (const peer of peersRef.current.values()) {
        await peer.replaceCameraTrack(track)
      }
      setIsVideoOff(false)
    } catch (e) {
      console.error('Failed to switch camera', e)
    }
  }

  const switchMic = async (deviceId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: { deviceId } })
      const track = stream.getAudioTracks()[0]
      if (!track) return
      userMediaRef.current.getAudioTracks().forEach((t) => t.stop())
      userMediaRef.current.getAudioTracks().forEach((t) => userMediaRef.current.removeTrack(t))
      userMediaRef.current.addTrack(track)
      for (const peer of peersRef.current.values()) {
        await peer.replaceMicTrack(track)
      }
      setIsMuted(false)
    } catch (e) {
      console.error('Failed to switch mic', e)
    }
  }

  return {
    isMuted,
    isVideoOff,
    peers,
    peersRef,
    userMediaRef,
    setPeers,
    toggleCamera,
    toggleMicrophone,
    startScreenShare,
    stopScreenShare,
    switchCamera,
    switchMic,
  }
}


