import { Call } from "@/types/entities";
import { SocketClientEmittedEvent, SocketServerEmittedEvent } from "@/types/events";
import { UUID } from "crypto";
import { createContext, useContext, useEffect, useState } from "react";
import { useSocket } from "./socket-context";
import { useMe } from "./user-context";

const log = (...args: any[]) => console.debug('[Call]: ', ...args)

interface CallContextValue {
  call: Call | null;
  callRinging: Call | null;
  joinCall: (call: Call) => void;
  startCall: (channelId: UUID, channelType: 'dm' | 'groups') => void;
}

const CallContext = createContext<CallContextValue | null>(null)

const CallContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useMe()
  const { socket } = useSocket()
  const [call, setCall] = useState<Call | null>(null)
  const [callRinging, setCallRinging] = useState<Call | null>(null)

  useEffect(() => {
    if (!socket) return

    const onCallStarted = (data: Call) => {
      log("New call started: ", data)
      // if a call is being running
      if (call) return
      setCallRinging(data) // Fixed: was setting callRinging to 'call' instead of 'data'
    }

    socket.on(SocketServerEmittedEvent.CALL_STARTED, onCallStarted)
    return () => {
      socket.off(SocketServerEmittedEvent.CALL_STARTED, onCallStarted)
    }
  }, [socket, call]) // Added 'call' to dependencies since it's used in the effect

  const joinCall = (call: Call) => {
    if (!socket) return
    socket.emit(SocketClientEmittedEvent.CALL_JOIN, call)
    log("Joining call: ", call)
    setCall(call)
  }

  const startCall = (channelId: UUID, channelType: 'dm' | 'groups') => {
    if (!socket) return
    socket.emit(SocketClientEmittedEvent.CALL_START, { channel_id: channelId, channel_type: channelType }, (callOrErr: string | Call) => {
      if (typeof callOrErr === 'string') {
        console.error(callOrErr)
        return
      }
      log("Starting call: ", callOrErr)
      setCall(callOrErr)
    })
  }
  const contextValue: CallContextValue = {
    call,
    callRinging,
    joinCall,
    startCall
  }


  return <CallContext.Provider value={contextValue}>
    {children}
  </CallContext.Provider>
}

// Custom hook to use the call context
const useCall = (): CallContextValue => {
  const context = useContext(CallContext)
  if (!context) {
    throw new Error('useCall must be used within a CallContextProvider')
  }
  return context
}

export { CallContextProvider, useCall };
