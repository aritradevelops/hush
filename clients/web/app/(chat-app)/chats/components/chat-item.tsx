'use client'
import Link from 'next/link';
import { EncryptedMessage } from '@/components/internal/encrypted-message';
import { useChats } from '@/hooks/use-chats';
import { ChannelType } from '@/types/entities';
import { UUID } from 'crypto';
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/time';

/**
 * Message preview component to show the last message or a placeholder
 */
function MessagePreview({ lastChat, channelId }: { lastChat: any, channelId: UUID }) {
  if (!lastChat) {
    return (
      <p className="text-sm text-muted-foreground truncate flex-1">
        Type your first message...
      </p>
    );
  }

  return (
    <p className="text-sm text-muted-foreground truncate flex-1">
      <span className="font-medium text-foreground">{"todo"}:</span>{' '}
      <EncryptedMessage
        message={lastChat.message}
        channel_id={channelId}
        iv={lastChat.iv}
      />
    </p>
  );
}

/**
 * ChatItem component displays a single chat in the chat list
 * Handles both direct messages and group chats
 */
export function ChatItem({ chat, activeChatId, setActiveChatId }: { chat: NonNullable<ReturnType<typeof useChats>['data']>[number], activeChatId: UUID | null, setActiveChatId: (id: UUID | null) => void }) {

  const isActive = activeChatId === chat.id;
  const hasUnreadMessages = !isActive && chat.unreadCount > 0;

  return (
    <Link
      href={`/chats/${chat.type === ChannelType.DIRECT_MESSAGE ? 'dms' : 'groups'}/${chat.id}`}
      className="block"
      onClick={() => setActiveChatId(chat.id)}
    >
      <div className={cn(
        "flex items-center p-4 hover:bg-accent rounded-lg cursor-pointer w-full max-w-5xl",
        isActive && "bg-accent/80"
      )}>
        <img
          src={chat.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.name}`}
          alt={chat.name}
          className="w-14 h-14 rounded-full mr-4"
        />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-lg">{chat.name}</h3>
            {!isActive && chat.lastChat && (
              <span className="text-sm text-muted-foreground">
                {formatTime(new Date().toUTCString())}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            {isActive ? (
              <p className="text-sm text-muted-foreground truncate flex-1">
                currently chatting...
              </p>
            ) : (
              <>
                <MessagePreview lastChat={chat.lastChat} channelId={chat.id} />
                {hasUnreadMessages && (
                  <span className="bg-primary text-primary-foreground rounded-full px-2.5 py-1 text-sm shrink-0">
                    {chat.unreadCount}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
} 