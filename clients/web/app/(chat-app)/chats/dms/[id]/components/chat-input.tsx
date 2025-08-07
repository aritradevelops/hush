import { useSocket } from "@/contexts/socket-context";
import { useMe } from "@/contexts/user-context";
import { Base64Utils } from "@/lib/base64";
import { AESGCM } from "@/lib/encryption";
import keysManager from "@/lib/internal/keys-manager";
import uploadManager from "@/lib/internal/upload-manager";
import { ApiListResponseSuccess } from "@/types/api";
import { Chat, ChatMedia, ChatMediaStatus, DmDetails, UserChatInteractionStatus } from "@/types/entities";
import { ReactQueryKeys } from "@/types/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { UUID } from "crypto";
import { Paperclip } from "lucide-react";
import { useRef, useState } from "react";
import * as uuid from "uuid";
export function ChatInput({ dm, files, discardFiles, openDropZone }: { dm?: DmDetails, files: File[], discardFiles: () => void, openDropZone: () => void }) {
  let [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const { sendMessage, emitTypingStart, emitTypingStop } = useSocket()
  const { user } = useMe()
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient()
  if (!dm) return <ChatInputSkeleton />
  const handleSendMessage = async () => {
    if (!message.trim()) {
      if (files.length) message = 'Sent attachments'
      else return
    }

    setSending(true)
    try {
      // find the shared secret for the dm
      const sharedSecret = await keysManager.getSharedSecret(dm.id, user.email)
      // encrypt the message
      const { encrypted, iv } = await AESGCM.encrypt(message, sharedSecret)

      const chat = {
        id: uuid.v4() as UUID,
        channel_id: dm.id,
        encrypted_message: encrypted,
        iv: iv,
        created_at: new Date().toISOString(),
        created_by: user.id,
        status: UserChatInteractionStatus.SENDING,
      }
      const uploadPromises: Promise<ChatMedia>[] = []
      if (files.length) {
        const newFiles = files
        // TODO: error handling
        const chatMedias = newFiles.map(f => {
          const cm = {
            id: uuid.v4() as UUID,
            name: f.name,
            chat_id: chat.id,
            channel_id: chat.channel_id,
            status: ChatMediaStatus.PENDING,
            mime_type: f.type,
            cloud_storage_url: URL.createObjectURL(f),
          } as ChatMedia
          uploadPromises.push(uploadManager.upload(cm, f, sharedSecret))
          return cm
        })
        // @ts-ignore
        chat.attachments = chatMedias
      }
      queryClient.setQueryData([ReactQueryKeys.DIRECT_MESSAGES_CHATS, dm.id],
        (oldData: { pages: ApiListResponseSuccess<Chat & { ucis?: UserChatInteractionStatus[] }>[], pageParams: number[] }) => {
          console.log('chat', chat)
          return {
            pages: [{ ...oldData.pages[0], data: [chat, ...oldData.pages[0].data] }],
            pageParams: oldData.pageParams
          }
        }
      );
      // set files empty
      discardFiles()

      // upload synchronously then
      const result = await Promise.all(uploadPromises)
      // @ts-ignore
      chat.attachments = result
      // send the message
      sendMessage(chat)

      setMessage('')
    } catch (error) {
      console.error('Error in message sending:', error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent form submission
      handleSendMessage();
    }
  }

  const handleTyping = () => {
    emitTypingStart(dm.id);

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      emitTypingStop(dm.id)
    }, 1000); // Stops detecting after 1 second of inactivity
  };
  return (
    <div className="border-t p-4">
      <div className="flex gap-2">
        <button
          className="p-2 rounded-lg bg-accent hover:bg-accent/80 transition-colors cursor-pointer"
          onClick={openDropZone}
        ><Paperclip />
        </button>
        <input
          type="text"
          placeholder={files.length ? "Attach message with files " : "Type a message..."}
          className="flex-1 rounded-lg bg-accent px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleTyping}
          value={message}
          disabled={dm.has_blocked}
        />
        <button
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 cursor-pointer"
          onClick={handleSendMessage}
          disabled={dm.has_blocked}
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  )
}

export function ChatInputSkeleton() {
  return (
    <div className="border-t p-4">
      <div className="flex gap-2">
        <div className="flex-1 h-16 rounded-lg bg-accent animate-pulse" />
        <div className="h-16 rounded-lg bg-accent animate-pulse" />
      </div>
    </div>
  )
}