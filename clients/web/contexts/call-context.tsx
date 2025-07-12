import { Caller, CallManager } from "@/lib/internal/call";
import { Call } from "@/types/entities";
import { SocketServerEmittedEvent } from "@/types/events";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSocket } from "./socket-context";
import { useMe } from "./user-context";


export const CallContext = createContext(undefined)


export function CallContextProvider({ children }: { children: React.ReactNode }) {
  const [callManager, setCallManager] = useState<CallManager | null>(null)
  const pendingCallQueueRef = useRef<Call[]>([])
  const { socket } = useSocket()

  useEffect(() => {
    if (!socket) return

    const onRunningCalls = ({ calls }: { calls: Call[] }) => {
      // pick the earliest call and push others onto queue
      calls.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      const call = calls[0]
      if (!call) return
      pendingCallQueueRef.current.push(...calls.slice(1, calls.length))
      const newManager = new CallManager(call, socket)
      setCallManager(newManager)
    }

    const onCallStarted = (data: Call & { from: string }) => {
      // and active call is running so push it to pending queue
      if (callManager)
        return pendingCallQueueRef.current.push(data)
      const newManager = new CallManager(data, socket)
      setCallManager(newManager)
    }
    const onCallEnded = (data: Call) => {
      // if existing call manager represents this call then only end it
      // and add new call from queue
      if (callManager && callManager.id === data.id) {
        callManager.cleanup()
        if (pendingCallQueueRef.current.length) {
          const call = pendingCallQueueRef.current.shift()!
          const newManager = new CallManager(call, socket)
          setCallManager(newManager)
        }
      }
    }

    socket.on(SocketServerEmittedEvent.CALL_RUNNING, onRunningCalls)
    socket.on(SocketServerEmittedEvent.CALL_STARTED, onCallStarted)
    socket.on(SocketServerEmittedEvent.CALL_ENDED, onCallEnded)
    return () => {
      socket.off(SocketServerEmittedEvent.CALL_RUNNING, onRunningCalls)
      socket.off(SocketServerEmittedEvent.CALL_STARTED, onCallStarted)
      socket.off(SocketServerEmittedEvent.CALL_ENDED, onCallEnded)
    }
  }, [socket, callManager])

  return <CallContext.Provider value={undefined}>
    {children}
  </CallContext.Provider>
}


export const useCall = () => {
  const ctx = useContext(CallContext)
  const { socket } = useSocket()
  const { user } = useMe()
  if (!ctx) throw new Error('`useCall` must be used within `CallContextProvider`')
  if (!socket) throw new Error('`useSocket` must be used within `SocketContextProvider`')
  const startCall = (channelId: string, channelType: string) => {
    const caller = new Caller(user.id, true, true, socket)
    // TODO: from here

  }

  return ctx
}
