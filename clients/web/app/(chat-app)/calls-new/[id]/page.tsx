'use client'
import React, { useCallback } from 'react'
import { useParams } from 'next/navigation'
import { UUID } from 'crypto'
import { useSocket } from '@/contexts/socket-context'
import { useMe } from '@/contexts/user-context'
import { useMediaDevices } from '@/hooks/use-media-devices'
import { cn } from '@/lib/utils'
import { useCallData } from '@/hooks/use-call-data'
import { SocketClientEmittedEvent } from '@/types/events'
import { isEncryptionPossible } from '@/config/wetbrtc'

import { CallGridNew } from '../components/call-grid'
import { CallControlsNew } from '../components/call-controls'
import { CallConnecting, CallNotFound, CallEnded, CallNotSupported } from '../../calls/components/call-states'
import { useCallControlsNew } from '@/hooks/use-call-controls-new'
import { useSocketCallHandlersNew } from '@/hooks/use-socket-call-handlers-new'

const CallPageNew: React.FC = () => {
  const params = useParams()
  const callId = params.id as UUID
  const { socket } = useSocket()
  const { user } = useMe()
  const isSupported = isEncryptionPossible()
  const { data: call, isLoading: isCallLoading } = useCallData(callId)
  const { devices, permissions, loading, error, refresh } = useMediaDevices()

  const {
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
  } = useCallControlsNew()

  useSocketCallHandlersNew({
    socket,
    call,
    peersRef,
    userMediaRef,
    setPeers,
    user,
  })

  const handleEndCall = useCallback(() => {
    if (!socket) return
    if (call) socket.emit(SocketClientEmittedEvent.CALL_LEAVE, call)
  }, [socket, call])

  if (!isSupported) return <CallNotSupported />
  if (isCallLoading || loading) return <CallConnecting />
  if (!isCallLoading && !call) return <CallNotFound />
  if (call && call.ended_at) return <CallEnded />

  return (
    <div className={cn('flex flex-col w-full h-full gap-2 p-5 justify-center items-center')}>
      <CallGridNew
        peers={peers}
        user={user}
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        userMediaRef={userMediaRef}
      />

      <CallControlsNew
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        onToggleMicrophone={toggleMicrophone}
        onToggleCamera={toggleCamera}
        onEndCall={handleEndCall}
        onStartScreenShare={startScreenShare}
        onStopScreenShare={stopScreenShare}
        onSwitchCamera={switchCamera}
        onSwitchMic={switchMic}
        devices={devices}
      />
    </div>
  )
}

export default CallPageNew


