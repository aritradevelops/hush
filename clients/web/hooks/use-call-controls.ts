import { useRef, useState } from 'react'
import { UUID } from 'crypto'
import { Peer } from '@/lib/webrtc/peer'

export const useCallControls = () => {
  const [isMuted, setIsMuted] = useState(true)
  const [isVideoOff, setIsVideoOff] = useState(true)
  const peersRef = useRef(new Map<UUID, Peer>())
  const userMediaRef = useRef(new MediaStream())
  const deviceMediaRef = useRef<MediaStream | null>(null)
  const [peers, setPeers] = useState<Peer[]>([])

  const toggleCamera = async () => {
    if (isVideoOff) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        })

        const videoTrack = stream.getVideoTracks()[0]
        if (videoTrack) {
          userMediaRef.current.addTrack(videoTrack)

          for (const peer of peersRef.current.values()) {
            await peer.addTrack(videoTrack, 'user')
          }

          setIsVideoOff(false)
        }
      } catch (error) {
        console.error('Error enabling camera:', error)
      }
    } else {
      const videoTracks = userMediaRef.current.getVideoTracks()

      for (const track of videoTracks) {
        for (const peer of peersRef.current.values()) {
          await peer.removeTrack(track)
        }

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
          userMediaRef.current.addTrack(audioTrack)

          for (const peer of peersRef.current.values()) {
            await peer.addTrack(audioTrack, 'user')
          }

          setIsMuted(false)
        }
      } catch (error) {
        console.error('Error enabling microphone:', error)
      }
    } else {
      const audioTracks = userMediaRef.current.getAudioTracks()

      for (const track of audioTracks) {
        for (const peer of peersRef.current.values()) {
          await peer.removeTrack(track)
        }

        track.stop()
        userMediaRef.current.removeTrack(track)
      }

      setIsMuted(true)
    }
  }

  return {
    isMuted,
    isVideoOff,
    peers,
    peersRef,
    userMediaRef,
    deviceMediaRef,
    setPeers,
    toggleCamera,
    toggleMicrophone
  }
}