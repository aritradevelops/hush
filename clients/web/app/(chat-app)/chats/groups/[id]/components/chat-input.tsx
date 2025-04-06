import { useSocket } from "@/contexts/socket-context";
import { AESGCM } from "@/lib/encryption";
import keysManager from "@/lib/internal/keys-manager";
import { Group, GroupMember, Contact, User } from "@/types/entities";
import { useRef, useState } from "react";

export function ChatInput({ group }: { group?: Group & { members: (GroupMember & { contact: Contact | null })[] } }) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const { sendMessage, emitTypingStart, emitTypingStop } = useSocket()
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  if (!group) return <ChatInputSkeleton />
  const handleSendMessage = async () => {
    if (!message.trim()) return; // Don't send empty messages

    setSending(true)
    // find the shared secret for the dm
    const sharedSecret = await keysManager.getSharedSecret(group.id)
    // encrypt the message
    const { encrypted, iv } = await AESGCM.encrypt(message, sharedSecret)
    // send the message
    sendMessage(group.id, encrypted, iv)
    setMessage('')
    setSending(false)
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
          placeholder="Type a message..."
          className="flex-1 rounded-lg bg-accent px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleTyping}
          value={message}
        />
        <button
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 cursor-pointer"
          onClick={handleSendMessage}
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