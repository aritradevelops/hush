
'use client'
import httpClient from "@/lib/http-client-old"
import { ReactQueryKeys } from "@/types/react-query"
import { useQuery } from "@tanstack/react-query"
import { UUID } from "crypto"
import { useParams } from "next/navigation"
import { ChatHeader } from "@/app/(chat-app)/chats/groups/[id]/components/chat-header"
import { ChatInput } from "@/app/(chat-app)/chats/groups/[id]/components/chat-input"
import { ChatsBody } from "@/app/(chat-app)/chats/groups/[id]/components/chat-body"

export default function GroupPage() {
  const params = useParams()
  const chatId = params.id as string
  const { data: group, isLoading: groupLoading } = useQuery({
    queryKey: [ReactQueryKeys.GROUPS, chatId],
    queryFn: () => httpClient.getGroupDetails(chatId as UUID),
    select: (data) => data.data
  })

  if (!groupLoading && !group) {
    return <div className="flex-1 flex flex-col h-full">
      <div className="text-center text-muted-foreground h-full flex items-center justify-center">
        Chat not found
      </div>
    </div>
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <ChatHeader group={group} />
      <ChatsBody group={group} />
      <ChatInput group={group} />
    </div>
  )
}