import React from 'react'
import { Camera, CameraOff, Mic, MicOff, PhoneOff, ScreenShare, Monitor, Mic2 } from 'lucide-react'

interface CallControlsNewProps {
  isMuted: boolean
  isVideoOff: boolean
  onToggleMicrophone: () => void
  onToggleCamera: () => void
  onEndCall: () => void
  onStartScreenShare: () => void
  onStopScreenShare: () => void
  onSwitchCamera: (deviceId: string) => void
  onSwitchMic: (deviceId: string) => void
  devices: {
    videoInputs: MediaDeviceInfo[]
    audioInputs: MediaDeviceInfo[]
    audioOutputs: MediaDeviceInfo[]
  }
}

export const CallControlsNew: React.FC<CallControlsNewProps> = ({
  isMuted,
  isVideoOff,
  onToggleMicrophone,
  onToggleCamera,
  onEndCall,
  onStartScreenShare,
  onStopScreenShare,
  onSwitchCamera,
  onSwitchMic,
  devices,
}) => {
  return (
    <div className='flex flex-wrap justify-center items-center w-full gap-2'>
      <div className='flex gap-2'>
        <button className='h-12 px-4 rounded-md bg-indigo-700 text-white' onClick={onToggleMicrophone}>
          {isMuted ? <MicOff /> : <Mic />}
        </button>
        <button className='h-12 px-4 rounded-md bg-cyan-800 text-white' onClick={onToggleCamera}>
          {isVideoOff ? <CameraOff /> : <Camera />}
        </button>
        <button className='h-12 px-4 rounded-md bg-red-500 text-white' onClick={onEndCall}>
          <PhoneOff />
        </button>
      </div>

      <div className='flex gap-2'>
        <button className='h-12 px-4 rounded-md bg-blue-600 text-white' onClick={onStartScreenShare}>
          <ScreenShare />
        </button>
        <button className='h-12 px-4 rounded-md bg-gray-600 text-white' onClick={onStopScreenShare}>
          <Monitor />
        </button>
      </div>

      <div className='flex gap-2 items-center'>
        <select
          className='h-10 rounded-md bg-neutral-800 text-white px-2'
          onChange={(e) => onSwitchCamera(e.target.value)}
          defaultValue={devices.videoInputs[0]?.deviceId || ''}
        >
          {devices.videoInputs.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(-4)}`}</option>
          ))}
        </select>
        <select
          className='h-10 rounded-md bg-neutral-800 text-white px-2'
          onChange={(e) => onSwitchMic(e.target.value)}
          defaultValue={devices.audioInputs[0]?.deviceId || ''}
        >
          {devices.audioInputs.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>{d.label || `Mic ${d.deviceId.slice(-4)}`}</option>
          ))}
        </select>
      </div>
    </div>
  )
}


