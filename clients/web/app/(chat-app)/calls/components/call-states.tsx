import React from 'react'

export const CallConnecting: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <div>connecting...</div>
    </div>
  )
}

export const CallNotFound: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <div>call not found...</div>
    </div>
  )
}

export const CallEnded: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <div>this call has been ended...</div>
    </div>
  )
}