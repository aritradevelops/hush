import { Call, CallTrackable } from "@/types/entities";
import { SocketClientEmittedEvent, SocketServerEmittedEvent } from "@/types/events";
import { UUID } from "crypto";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSocket } from "./socket-context";
import { Base64Utils } from "@/lib/base64";
import httpClient from "@/lib/http-client";

const log = (...args: any[]) => console.debug('[Call]: ', ...args)

interface CallContextValue {
  call: Call | null;
  ongoingCalls: CallTrackable[];
  joinCall: (call: Call) => void;
  leaveCall: (call: Call) => void;
  declineCall: (call: Call) => void;
  startCall: (channelId: UUID, channelType: 'dm' | 'group', cb: (callOrError: Call | string) => void) => void;
}

const CallContext = createContext<CallContextValue | null>(null)

const CallContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { socket } = useSocket()
  const [call, setCall] = useState<Call | null>(null)
  const [ongoingCalls, setOngoingCalls] = useState<CallTrackable[]>([])

  useEffect(() => {
    httpClient.getOngoingCalls().then(data => {
      setOngoingCalls(data.data.map(call => ({ call, state: 'pending' })))
    })
  }, [])

  // Auto ring the next pending call
  useEffect(() => {
    if (!ongoingCalls.find(c => c.state == 'ringing')) {
      const pendingCall = ongoingCalls.find(c => c.state == 'pending')
      if (pendingCall) {
        setOngoingCalls(p => [...p.map(ct => {
          return ct.call.id === pendingCall.call.id ? { ...ct, state: 'ringing' } as CallTrackable : ct
        })])
      }
    }
  }, [ongoingCalls])

  useEffect(() => {
    if (!socket) return

    const onCallStarted = (data: Call) => {
      log("New call started: ", data)
      // if a call is being running push it and wait else start ringing
      setOngoingCalls(p => [...p, { call: data, state: call ? 'pending' : 'ringing' }])
    }
    const onCallEnded = (data: Call) => {
      log("call ended", data)
      setOngoingCalls(p => [...p.filter(c => c.call.id !== data.id)])
    }

    socket.on(SocketServerEmittedEvent.CALL_STARTED, onCallStarted)
    socket.on(SocketServerEmittedEvent.CALL_ENDED, onCallEnded)
    return () => {
      socket.off(SocketServerEmittedEvent.CALL_STARTED, onCallStarted)
      socket.off(SocketServerEmittedEvent.CALL_ENDED, onCallEnded)
    }
  }, [socket, call])

  const joinCall = (call: Call) => {
    log("Joining call: ", call)
    setCall(call)
    window.open(`/calls-new/${call.id}`, '_blank')
  }

  const startCall = (channelId: UUID, channelType: 'dm' | 'group', cb: (callOrErr: string | Call) => void) => {
    if (!socket) return
    socket.emit(SocketClientEmittedEvent.CALL_START, {
      channel_id: channelId, channel_type: channelType,
      iv: Base64Utils.encode(crypto.getRandomValues(new Uint8Array(16)))
    }, (callOrErr: string | Call) => {
      if (typeof callOrErr === 'string') {
        console.error(callOrErr)
      } else {
        log("Starting call: ", callOrErr)
        setCall(callOrErr)
      }
      cb(callOrErr)
    })
  }
  const declineCall = (call: Call) => {
    if (!socket) return
    setOngoingCalls(p => [...p.map(ct => {
      if (ct.call.id === call.id) {
        return {
          ...ct, state: 'declined'
        } as CallTrackable
      } else {
        return ct
      }
    })])
  }

  const leaveCall = (call: Call) => {
    if (!socket) return
    socket.emit(SocketClientEmittedEvent.CALL_LEAVE, call)
    log('Leaving call')
    // window.close()
  }

  const contextValue: CallContextValue = {
    call,
    ongoingCalls,
    declineCall,
    joinCall,
    startCall,
    leaveCall
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

