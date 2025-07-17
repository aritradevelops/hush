import { Call } from "@/types/entities";
import { createContext, useEffect, useRef, useState } from "react";
import { useMe } from "./user-context";
import httpClient from "@/lib/http-client";
import { useSocket } from "./socket-context";
import { SocketClientEmittedEvent, SocketServerEmittedEvent } from "@/types/events";

const log = (...args: any[]) => console.debug('[Call]: ', ...args)

const CallContext = createContext(null)

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
      setCallRinging(call)
    }

    const joinCall = (call: Call) => {
      socket.emit(SocketClientEmittedEvent.CALL_JOIN, call)
      log("Joining call: ", call)
      setCall(call)
    }

    socket.on(SocketServerEmittedEvent.CALL_STARTED, onCallStarted)
    return () => {
      socket.off(SocketServerEmittedEvent.CALL_STARTED, onCallStarted)
    }
  }, [socket])

  return <CallContext.Provider value={null}>
    {children}
  </CallContext.Provider>
}