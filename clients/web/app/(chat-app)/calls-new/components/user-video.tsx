import React from 'react'
import { User } from '@/types/entities'

interface UserVideoNewProps {
  user: User
  isVideoOff: boolean
  isMuted: boolean
  userMediaRef: React.MutableRefObject<MediaStream>
}

export const UserVideoNew: React.FC<UserVideoNewProps> = ({ user, isVideoOff, isMuted, userMediaRef }) => {
  return (
    <div className="relative flex justify-center items-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 w-full h-full min-h-0 overflow-hidden aspect-video">
      {isVideoOff ? (
        <img
          src={user.dp || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
          alt={user.name}
          className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <video
          ref={(r) => {
            if (r) {
              r.srcObject = userMediaRef.current
            }
          }}
          playsInline
          autoPlay
          muted
          className="w-full h-full object-contain"
        />
      )}

      <div className='absolute bottom-2 left-2 bg-black/50 rounded-md px-2 py-1 z-10'>
        <span className="text-white text-xs sm:text-sm font-medium">{user.name}</span>
      </div>
    </div>
  )
}


