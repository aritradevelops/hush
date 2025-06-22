'use client'
import { ChatsBody } from "@/app/(chat-app)/chats/dms/[id]/components/chat-body"
import { ChatHeader } from "@/app/(chat-app)/chats/dms/[id]/components/chat-header"
import { ChatInput } from "@/app/(chat-app)/chats/dms/[id]/components/chat-input"
import { Attachments } from "@/components/internal/attachements"
import { FilesPreview } from "@/components/internal/file-preview"
import httpClient from "@/lib/http-client"
import { ReactQueryKeys } from "@/types/react-query"
import { useQuery } from "@tanstack/react-query"
import { UUID } from "crypto"
import { useParams } from "next/navigation"
import { useEffect } from "react"
export default function DMPage() {
  const params = useParams()
  const chatId = params.id as UUID
  const { data: dm, isLoading: dmLoading } = useQuery({
    queryKey: [ReactQueryKeys.DIRECT_MESSAGE_DETAILS, chatId],
    queryFn: () => httpClient.getDmDetails(chatId as UUID),
    select: (data) => data.data
  })

  if (!dmLoading && !dm) {
    return <div className="flex-1 flex flex-col h-full">
      <div className="text-center text-muted-foreground h-full flex items-center justify-center">
        Chat not found
      </div>
    </div>
  }

  return (
    <Attachments channelId={chatId}>
      {({ files, discardFiles, upload }) => (
        <>
          <ChatHeader dm={dm} />
          {dm && (
            files.length > 0 ? (
              <FilesPreview files={files} discardFiles={discardFiles} />
            ) : (
              <ChatsBody dm={dm} />
            )
          )}
          <ChatInput dm={dm} files={files} discardFiles={discardFiles} />
        </>
      )}
    </Attachments>
  )
}
