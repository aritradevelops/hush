import React from 'react'
import { cn } from '@/lib/utils'
import { Peer } from '@/lib/webrtc/peer'
import { UserVideo } from './user-video'
import { PeerVideo } from './peer-video'
import { User } from '@/types/entities'

interface CallGridProps {
  peers: Peer[]
  user: User
  isVideoOff: boolean
  userMediaRef: React.MutableRefObject<MediaStream>
}

export const CallGrid: React.FC<CallGridProps> = ({ peers, user, isVideoOff, userMediaRef }) => {
  const totalParticipants = peers.length + 1 // +1 for the current user

  const getGridLayout = () => {
    if (totalParticipants === 1) return 'grid-cols-1 grid-rows-1'
    if (totalParticipants === 2) return 'grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1'
    if (totalParticipants === 3) return 'grid-cols-1 grid-rows-3 md:grid-cols-2 md:grid-rows-2'
    if (totalParticipants === 4) return 'grid-cols-2 grid-rows-2'
    if (totalParticipants <= 6) return 'grid-cols-2 grid-rows-3 lg:grid-cols-3 lg:grid-rows-2'
    if (totalParticipants <= 9) return 'grid-cols-3 grid-rows-3'
    return 'grid-cols-4 grid-rows-3' // For more than 9 participants
  }

  return (
    <div className={cn('h-full w-full grid gap-2 p-2', getGridLayout())}>
      <UserVideo user={user} isVideoOff={isVideoOff} userMediaRef={userMediaRef} />
      {peers.map(peer => (
        <PeerVideo peer={peer} key={peer.id} />
      ))}
    </div>
  )
}
