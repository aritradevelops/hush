import { Button } from "@/components/ui/button";
import { useCall } from "@/contexts/call-context";
import { useScreen } from "@/contexts/screen-context";
import { useSocket } from "@/contexts/socket-context";
import { Base64Utils } from "@/lib/base64";
import { DirectMessage, Contact, User, DmDetails, Call } from "@/types/entities";
import { SocketClientEmittedEvent } from "@/types/events";
import { ReactQueryKeys } from "@/types/react-query";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@radix-ui/react-tooltip";
import { useQueryClient } from "@tanstack/react-query";
import { UserX, UserPlus, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function ChatHeader({ dm }: { dm?: DmDetails }) {
  const { addContact, socket } = useSocket()
  const queryClient = useQueryClient()
  const { call, ongoingCalls, startCall, joinCall } = useCall()
  const { isMobile } = useScreen()
  const router = useRouter()
  if (!dm) return <ChatHeaderSkeleton />
  const localCall: Call | null = ongoingCalls.find(c => c.call.channel_id === dm.id)?.call || null
  console.debug(ongoingCalls)
  const handleAddContact = () => {
    addContact(dm.chat_user.id, () => {
      queryClient.invalidateQueries({ queryKey: [ReactQueryKeys.DIRECT_MESSAGE_DETAILS, dm.id] })
    })
  }

  const handleBlockUser = () => {
    // Block user functionality
    console.debug('Block user:', dm.chat_user.id)
  }

  const handleCLick = () => {
    if (localCall) {
      // join the call
      joinCall(localCall)
    } else {
      // start new call
      startCall(dm.id, 'dm', (callOrErr) => {
        if (typeof callOrErr == 'string') {
          alert(callOrErr)
        } else {
          joinCall(callOrErr)
        }
      })
    }
  }
  return (
    <div className="border-b p-4">
      <div className="flex items-center gap-4">
        {isMobile && <button type="button" onClick={() => router.back()}>
          <ArrowLeft />
        </button>}
        <img
          src={dm.chat_user.dp || `https://api.dicebear.com/7.x/avataaars/svg?seed=${dm.chat_user.name}`}
          alt={dm.chat_user.name}
          className="w-12 h-12 rounded-full"
        />
        <div>
          <div className="flex justify-center gap-2 items-center">
            <h2 className="text-lg font-semibold">{dm.contact?.nickname || dm.chat_user.name}</h2>
            <div className="flex gap-2">
              {!dm.contact && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleAddContact}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4 mx-auto text-green-500" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md">
                      Add to contacts
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleBlockUser}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      <UserX className="w-4 h-4 mx-auto text-red-500" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md">
                    Block User
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Private Chat
          </p>
        </div>
        <div className="ml-auto">
          <Button
            onClick={handleCLick}
            className="bg-green-500 border-2 border-b-green-800 border-r-green-800 hover:bg-green-500"
          >
            {localCall ? 'Join Call' : 'Start Call'}
          </Button>

        </div>
      </div>
    </div>
  )
}

export function ChatHeaderSkeleton() {
  return (
    <div className="border-b p-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-accent animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 w-32 bg-accent rounded animate-pulse" />
          <div className="h-4 w-24 bg-accent rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}