'use client'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { GroupChannel, PrivateChannel } from '@/lib/http-client'
import httpClient from '@/lib/http-client'
import { UUID } from 'crypto'

export default function ChatPage() {
  const params = useParams()
  const chatId = params.id as string

  const { data: allChats } = useQuery({
    queryKey: ['chats'],
    queryFn: () => httpClient.getAllChannels('')
  })

  const chat = allChats?.find(c => c.id === chatId) as GroupChannel | PrivateChannel | undefined
  const { data: messages } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => httpClient.getMessages(chatId as UUID)
  })
  console.log(messages)
  return (
    <div className="flex-1 flex flex-col">
      {!chat ? (
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
  )
}

function ChatView({ chat }: { chat: GroupChannel | PrivateChannel }) {
  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="border-b p-4">
        <div className="flex items-center gap-4">
          <img
            src={chat.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.name}`}
            alt={chat.name}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <h2 className="text-lg font-semibold">{chat.name}</h2>
            <p className="text-sm text-muted-foreground">
              {chat.type === 'direct' ? 'Private Chat' : 'Group Chat'}
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