import React from 'react'
import { Camera, CameraOff, Mic, MicOff, PhoneOff, ScreenShare } from 'lucide-react'

interface CallControlsProps {
  isMuted: boolean
  isVideoOff: boolean
  onToggleMicrophone: () => void
  onToggleCamera: () => void
  onEndCall?: () => void
  onScreenShare?: () => void
}

export const CallControls: React.FC<CallControlsProps> = ({
  isMuted,
  isVideoOff,
  onToggleMicrophone,
  onToggleCamera,
  onEndCall,
  onScreenShare
}) => {
  return (
    <div className='flex justify-center items-center w-full h-16 gap-x-3'>
      <div
        className='h-12 w-12 rounded-md flex justify-center items-center bg-indigo-700 cursor-pointer'
        onClick={onToggleMicrophone}
      >
        {isMuted ? <MicOff /> : <Mic />}
      </div>

      <div
        className='h-12 w-12 rounded-md flex justify-center items-center bg-cyan-800 cursor-pointer'
        onClick={onToggleCamera}
      >
        {isVideoOff ? <CameraOff /> : <Camera />}
      </div>

      <div
        className='h-12 w-12 rounded-md flex justify-center items-center bg-blue-500 cursor-pointer'
        onClick={onScreenShare}
      >
        <ScreenShare />
      </div>

      <div
        className='h-12 w-12 rounded-md flex justify-center items-center bg-red-500 cursor-pointer'
        onClick={() => {
          onEndCall?.()
          window.close()
        }}
      >
        <PhoneOff />
      </div>
    </div>
  )
}