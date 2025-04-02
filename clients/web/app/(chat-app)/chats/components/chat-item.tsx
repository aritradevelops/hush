'use client'
import Link from 'next/link';
import { EncryptedMessage } from '@/components/internal/encrypted-message';
import { useChats } from '@/hooks/use-chats';
import { ChannelType } from '@/types/entities';

export function ChatItem({ chat }: { chat: NonNullable<ReturnType<typeof useChats>['data']>[number] }) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Link href={`/chats/${chat.type === ChannelType.DIRECT_MESSAGE ? 'dms' : 'groups'}/${chat.id}`} className="block">
      <div className="flex items-center p-4 hover:bg-accent rounded-lg cursor-pointer w-full max-w-5xl">
        <img
          src={chat.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.name}`}
          alt={chat.name}
          className="w-14 h-14 rounded-full mr-4"
        />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-lg">{chat.name}</h3>
            {chat.lastChat && (
              <span className="text-sm text-muted-foreground">
                {formatTime(new Date().toUTCString())}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {chat.lastChat ? (
              <p className="text-sm text-muted-foreground truncate flex-1">
                <span className="font-medium text-foreground">
                  {"todo"}:
                </span>
                {' '}
                <EncryptedMessage
                  message={chat.lastChat.message}
                  channel_id={chat.id}
                  iv={chat.lastChat.iv}
                />
              </p>
            ) : (
              <p className="text-sm text-muted-foreground truncate flex-1">
                Type your first message..
              </p>
            )}
            {chat.unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground rounded-full px-2.5 py-1 text-sm shrink-0">
                {chat.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
} 