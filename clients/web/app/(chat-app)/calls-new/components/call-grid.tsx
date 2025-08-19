import React from 'react'
import { cn } from '@/lib/utils'
import { PeerNew } from '@/lib/webrtc/peer-new'
import { User } from '@/types/entities'
import { UserVideoNew } from '@/app/(chat-app)/calls-new/components/user-video'
import { PeerVideoNew } from '@/app/(chat-app)/calls-new/components/peer-video'

interface CallGridNewProps {
  peers: PeerNew[]
  user: User
  isVideoOff: boolean
  isMuted: boolean
  userMediaRef: React.MutableRefObject<MediaStream>
}

export const CallGridNew: React.FC<CallGridNewProps> = ({ peers, user, isVideoOff, isMuted, userMediaRef }) => {
  const totalParticipants = peers.length + 1

  const getGridLayout = () => {
    if (totalParticipants === 1) return 'grid-cols-1 grid-rows-1'
    if (totalParticipants === 2) return 'grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1'
    if (totalParticipants === 3) return 'grid-cols-1 grid-rows-3 md:grid-cols-2 md:grid-rows-2'
    if (totalParticipants === 4) return 'grid-cols-2 grid-rows-2'
    if (totalParticipants <= 6) return 'grid-cols-2 grid-rows-3 lg:grid-cols-3 lg:grid-rows-2'
    if (totalParticipants <= 9) return 'grid-cols-3 grid-rows-3'
    return 'grid-cols-4 grid-rows-3'
  }

  return (
    <div className={cn('h-full w-full grid gap-2 p-2', getGridLayout())}>
      <UserVideoNew user={user} isVideoOff={isVideoOff} isMuted={isMuted} userMediaRef={userMediaRef} />
      {peers.map(peer => (
        <PeerVideoNew peer={peer} key={peer.id} />
      ))}
    </div>
  )
}


