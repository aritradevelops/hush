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
export const CallNotSupported: React.FC = () => {
  return (
    <div className="flex justify-center items-center w-full h-full">
      <h1>Opps!</h1>
      <h2 className='text-3xl'>It seems your browser does not support, End-to-End encrypted calls.</h2>
      <p> We are working on this, till then please consider using Chrome to attend this call</p>
      <p> If you are already using chrome please update your browser</p>
    </div>
  )
}