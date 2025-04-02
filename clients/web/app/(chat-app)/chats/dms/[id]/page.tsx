'use client'
import { EncryptedMessage } from "@/components/internal/encrypted-message"
import { useSocket } from "@/hooks/use-socket"
import { AESGCM } from "@/lib/encryption"
import httpClient from "@/lib/http-client"
import keysManager from "@/lib/internal/keys-manager"
import { cn } from "@/lib/utils"
import { Chat, Contact, DirectMessage, User } from "@/types/entities"
import { ReactQueryKeys } from "@/types/react-query"
import { useQuery } from "@tanstack/react-query"
import { UUID } from "crypto"
import { useParams } from "next/navigation"
import { useState } from "react"

export default function DMPage() {
  const params = useParams()
  const chatId = params.id as string
  const { data: dm, isLoading: dmLoading } = useQuery({
    queryKey: [ReactQueryKeys.DIRECT_MESSAGE_DETAILS, chatId],
    queryFn: () => httpClient.getDirectMessageDetails(chatId as UUID),
    select: (data) => data.data
  })
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: [ReactQueryKeys.DIRECT_MESSAGES_CHATS, chatId],
    queryFn: () => httpClient.listMessages(chatId as UUID),
    select: (data) => data.data,
    enabled: !!dm
  })

  // Check if both resources are fully loaded
  const isLoading = dmLoading || messagesLoading || !dm || !messages

  if (!dmLoading && !dm) {
    return <div className="flex-1 flex flex-col h-full">
      <div className="text-center text-muted-foreground h-full flex items-center justify-center">
        Chat not found
      </div>
    </div>
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {dmLoading ? (
        <ChatHeaderSkeleton />
      ) : (
        <ChatHeader dm={dm!} />
      )}
      {
        isLoading ? (
          <ChatsBodySkeleton />
        ) : (
          <ChatsBody messages={messages!} dm={dm!} />
        )
      }
      {!dmLoading && dm && <ChatInput dm={dm} />}
    </div>
  )
}

function ChatHeader({ dm }: { dm: DirectMessage & { contact: Contact | null } & { chat_user: User } }) {
  return (
    <div className="border-b p-4">
      <div className="flex items-center gap-4">
        <img
          src={dm.chat_user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${dm.chat_user.name}`}
          alt={dm.chat_user.name}
          className="w-12 h-12 rounded-full"
        />
        <div>
          <h2 className="text-lg font-semibold">{dm.contact?.name || dm.chat_user.name}</h2>
          <p className="text-sm text-muted-foreground">
            Private Chat
          </p>
        </div>
      </div>
    </div>
  )
}

function ChatHeaderSkeleton() {
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

function ChatInput({ dm }: { dm: DirectMessage & { contact: Contact | null } & { chat_user: User } }) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const { sendMessage } = useSocket()
  const handleSendMessage = async () => {
    setSending(true)
    // find the shared secret for the dm
    const sharedSecret = await keysManager.getSharedSecret(dm.id)
    // encrypt the message
    const { encrypted, iv } = await AESGCM.encrypt(message, sharedSecret)
    // send the message
    sendMessage(dm.id, encrypted, iv)
    setMessage('')
    setSending(false)
  }
  return (
    <div className="border-t p-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 rounded-lg bg-accent px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          onChange={(e) => setMessage(e.target.value)}
          value={message}
        />
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 cursor-pointer" onClick={handleSendMessage}>
          {sending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  )
}

function ChatsBody({ messages, dm }: { messages: Chat[], dm: DirectMessage & { contact: Contact | null } & { chat_user: User } }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
      {messages.map((message) => (
        <div className="w-full flex" key={message.id}>
          <EncryptedMessage
            message={message.message}
            iv={message.iv}
            channel_id={message.channel_id}
            className={cn(
              "max-w-2xl bg-accent rounded-lg p-2 items-center",
              message.created_by === dm.chat_user.id ?
                "bg-primary text-primary-foreground justify-self-start" : "bg-secondary text-secondary-foreground justify-self-end",
            )}
          />
        </div>
      ))}
    </div>
  )
}
function ChatsBodySkeleton() {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="flex flex-col gap-2">
        <div className="w-full h-12 bg-accent rounded-lg animate-pulse" />
      </div>
    </div>
  )
}