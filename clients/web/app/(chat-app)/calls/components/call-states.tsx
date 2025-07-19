import React from 'react'

export const CallConnecting: React.FC = () => {
  return (
    <div className="flex justify-center items-center w-full h-full">
      <h1 className='text-3xl'>Hold up! we are trying to set you up...</h1>
    </div>
  )
}

export const CallNotFound: React.FC = () => {
  return (
    <div className="flex justify-center items-center w-full h-full">
      <h1 className='text-3xl'>Nothing right here...</h1>
    </div>
  )
}

export const CallEnded: React.FC = () => {
  return (
    <div className="flex justify-center items-center w-full h-full">
      <h1 className='text-3xl'>This call has been ended...</h1>
    </div>
  )
}