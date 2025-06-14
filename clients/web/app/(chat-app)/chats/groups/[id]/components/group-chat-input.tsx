import { useSocket } from "@/contexts/socket-context";
import { useMe } from "@/contexts/user-context";
import { AESGCM } from "@/lib/encryption";
import keysManager from "@/lib/internal/keys-manager";
import { ApiListResponseSuccess } from "@/types/api";
import { DmDetails, UserChatInteractionStatus, Chat, GroupDetails } from "@/types/entities";
import { ReactQueryKeys } from "@/types/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { UUID } from "crypto";
import { useRef, useState } from "react";
import * as uuid from "uuid";


export function GroupChatInput({ group, files }: { group?: GroupDetails, files: File[] }) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const { sendMessage, emitTypingStart, emitTypingStop } = useSocket()
  const { user } = useMe()
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient()
  if (!group) return <ChatInputSkeleton />
  const handleSendMessage = async () => {
    if (!message.trim()) return; // Don't send empty messages

    setSending(true)
    try {
      // find the shared secret for the dm
      const sharedSecret = await keysManager.getSharedSecret(group.id, user.email)
      // encrypt the message
      const { encrypted, iv } = await AESGCM.encrypt(message, sharedSecret)

      const chat = {
        id: uuid.v4() as UUID,
        channel_id: group.id,
        encrypted_message: encrypted,
        iv: iv,
        created_at: new Date().toISOString(),
        created_by: user.id,
        status: UserChatInteractionStatus.SENDING
      }
      queryClient.setQueryData([ReactQueryKeys.DIRECT_MESSAGES_CHATS, group.id],
        (oldData: { pages: ApiListResponseSuccess<Chat & { status: UserChatInteractionStatus }>[], pageParams: number[] }) => {
          return {
            pages: [{ ...oldData?.pages[0], data: [chat, ...oldData?.pages[0].data] }],
            pageParams: oldData?.pageParams
          }
        }
      );
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
    emitTypingStart(group.id);

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      emitTypingStop(group.id)
    }, 1000); // Stops detecting after 1 second of inactivity
  };
  return (
    <div className="border-t p-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={files.length ? "Attach message with files " : "Type a message..."}
          className="flex-1 rounded-lg bg-accent px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleTyping}
          value={message}
          disabled={group.has_left}
        />
        <button
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 cursor-pointer"
          onClick={handleSendMessage}
          disabled={group.has_left || sending}
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
