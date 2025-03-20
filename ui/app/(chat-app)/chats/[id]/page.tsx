'use client'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { fetchChatById } from '../api'
import { ChatList } from '../components/chat-list'
import { Chat } from '../types'

export default function ChatPage() {
  const params = useParams()
  const chatId = params.id as string

  const { data: chat, isLoading } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => fetchChatById(chatId),
    enabled: !!chatId
  })

  return (
    <div className="flex h-full">
      <ChatList />
      <div className="flex-1 flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !chat ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Chat Not Found</h2>
              <p className="text-muted-foreground">The chat you're looking for doesn't exist.</p>
            </div>
          </div>
        ) : (
          <ChatView chat={chat} />
        )}
      </div>
    </div>
  )
}

function ChatView({ chat }: { chat: Chat }) {
  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="border-b p-4">
        <div className="flex items-center gap-4">
          <img
            src={chat.avatar}
            alt={chat.name}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <h2 className="text-lg font-semibold">{chat.name}</h2>
            <p className="text-sm text-muted-foreground">
              {chat.type === 'private' ? 'Private Chat' : 'Group Chat'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Chat messages will go here */}
        <div className="text-center text-muted-foreground">
          Chat messages coming soon...
        </div>
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 rounded-lg bg-accent px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90">
            Send
          </button>
        </div>
      </div>
    </div>
  )
} 