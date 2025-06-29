import { createContext, useContext, useState } from "react";

export interface CallContextInterface {
  isCalling: boolean
  startCall: (channelId: string) => void
}

const CallContext = createContext<CallContextInterface | undefined>(undefined)

export const CallContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [isCalling, setIsCalling] = useState(false)
  const [channelId, setChannelId] = useState('')
  const startCall = (channelId: string) => {
    if (isCalling) return
    setChannelId(channelId)
    setIsCalling(true)
  }
  return <CallContext.Provider value={{ isCalling, startCall }}>
    {children}
  </CallContext.Provider>
}

export const useCall = () => {
  const values = useContext(CallContext)
  if (!values) throw new Error('`useCall` must be used within `CallContextProvider`')
  return values
}