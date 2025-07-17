'use client'
import React from 'react'
import { useParams } from 'next/navigation'
import { UUID } from 'crypto'
import { useSocket } from '@/contexts/socket-context'
import { useMe } from '@/contexts/user-context'
import { useMediaDevices } from '@/hooks/use-media-devices'
import { cn } from '@/lib/utils'

// Import our new components and hooks
import { useCallData } from '@/hooks/use-call-data'
import { useCallControls } from '@/hooks/use-call-controls'
import { useSocketHandlers } from '@/hooks/use-socket-handlers'
import { CallControls } from '@/app/(chat-app)/calls/components/call-controls'
import { CallGrid } from '@/app/(chat-app)/calls/components/call-grid'
import { CallConnecting, CallNotFound, CallEnded } from '@/app/(chat-app)/calls/components/call-states'

const CallPage: React.FC = () => {
  const params = useParams()
  const callId = params.id as UUID
  const { socket } = useSocket()
  const { user } = useMe()

  const { data: call, isLoading: isCallLoading } = useCallData(callId)
  const { devices, permissions, loading, error, refresh } = useMediaDevices()

  const {
    isMuted,
    isVideoOff,
    peers,
    peersRef,
    userMediaRef,
    deviceMediaRef,
    setPeers,
    toggleCamera,
    toggleMicrophone
  } = useCallControls()

  useSocketHandlers({
    socket,
    call,
    peersRef,
    userMediaRef,
    deviceMediaRef,
    setPeers,
    user
  })

  if (isCallLoading || loading) return <CallConnecting />
  if (!isCallLoading && !call) return <CallNotFound />
  if (call && call.ended_at) return <CallEnded />

  const getGridRows = () => {
    if (peers.length === 0) return 'grid-rows-1'
    if (peers.length === 1) return 'grid-rows-2'
    return 'grid-rows-2'
  }

  const getGridCols = () => {
    if (peers.length === 0) return 'grid-cols-1'
    if (peers.length === 1) return 'grid-cols-1'
    return 'grid-cols-2'
  }

  return (
    <div className={cn('flex flex-col w-full h-full gap-2 p-5 justify-center items-center', getGridCols(), getGridRows())}>
      <CallGrid
        peers={peers}
        user={user}
        isVideoOff={isVideoOff}
        userMediaRef={userMediaRef}
      />

      <CallControls
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        onToggleMicrophone={toggleMicrophone}
        onToggleCamera={toggleCamera}
        onEndCall={() => {
          // Handle end call logic
          console.log('End call clicked')
        }}
        onScreenShare={() => {
          // Handle screen share logic
          console.log('Screen share clicked')
        }}
      />
    </div>
  )
}

export default CallPage