'use client'

import { DialogContent, DialogDescription, DialogHeader } from "@/components/ui/dialog"
import { useCall } from "@/contexts/call-context"
import httpClient from "@/lib/http-client"
import { DmDetails, GroupDetails } from "@/types/entities"
import { ReactQueryKeys } from "@/types/react-query"
import { Dialog, DialogTitle } from "@radix-ui/react-dialog"
import { useQuery } from "@tanstack/react-query"
import { PhoneCall, PhoneMissed } from "lucide-react"

export function IncomingCallModal() {
  const { ongoingCalls, call, joinCall, declineCall } = useCall()
  const callRinging = call ? null : (ongoingCalls.find(ct => ct.state == 'ringing') || null)

  // Always call hooks at the top level
  const dmQuery = useQuery({
    queryKey: [ReactQueryKeys.DIRECT_MESSAGE_DETAILS, callRinging?.call.channel_id],
    queryFn: () => httpClient.getDmDetails(callRinging!.call.channel_id),
    select: (data) => data.data,
    enabled: Boolean(callRinging && callRinging.call.channel_type === 'dm')
  })

  const groupQuery = useQuery({
    queryKey: [ReactQueryKeys.GROUP_DETAILS, callRinging?.call.channel_id],
    queryFn: () => httpClient.getGroupDetails(callRinging!.call.channel_id),
    select: (data) => data.data,
    enabled: Boolean(callRinging && callRinging.call.channel_type === 'group')
  })

  // Handle conditional logic after hooks
  if (!callRinging) return null

  const isDm = callRinging.call.channel_type === 'dm'
  const activeQuery = isDm ? dmQuery : groupQuery

  if (!activeQuery.data) return null

  const name = isDm
    ? (activeQuery.data as DmDetails).chat_user.name
    : (activeQuery.data as GroupDetails).metadata?.name

  const dp = isDm
    ? (activeQuery.data as DmDetails).chat_user.dp
    : (activeQuery.data as GroupDetails).metadata?.image

  return (
    <Dialog open={!activeQuery.isLoading}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader className="flex flex-col items-center space-y-4">
          <img
            src={dp || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`}
            alt={name}
            className="w-20 h-20 rounded-full border-4"
          />
          <div className="text-center space-y-1">
            <DialogTitle className="text-xl font-semibold">{name}</DialogTitle>
            <DialogDescription className="text-lg font-medium text-foreground">
              is calling...
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex justify-center gap-6 mt-6">
          <div
            onClick={() => joinCall(callRinging.call)}
            className="w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center cursor-pointer transition"
          >
            <PhoneCall className="w-6 h-6" />
          </div>
          <div
            onClick={() => declineCall(callRinging.call)}
            className="w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center cursor-pointer transition"
          >
            <PhoneMissed className="w-6 h-6" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
