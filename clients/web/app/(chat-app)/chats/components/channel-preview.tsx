'use client'
import { EncryptedMessage } from '@/components/internal/encrypted-message';
import { formatTime } from '@/lib/time';
import { cn } from '@/lib/utils';
import { ChannelOverview, ChannelType } from '@/types/entities';
import { UUID } from 'crypto';
import Link from 'next/link';

/**
 * Message preview component to show the last message or a placeholder
 */
function MessagePreview({ lastChat, channelId }: { lastChat: ChannelOverview['last_chat'], channelId: UUID }) {
  if (!lastChat) {
    return (
      <p className="text-sm text-muted-foreground truncate flex-1">
        Type your first message...
      </p>
    );
  }

  return (
    <p className="text-sm text-muted-foreground truncate flex-1">
      <span className="font-medium text-foreground">{lastChat.sender_name}:</span>{' '}
      {
        lastChat.deleted_at ? (
          <span className={cn("text-sm text-muted-foreground")}>
            Deleted message
          </span>
        ) : (
          <EncryptedMessage
            message={lastChat.encrypted_message}
            channel_id={channelId}
            iv={lastChat.iv}
          />
        )
      }
    </p>
  );
}

/**
 * ChatItem component displays a single chat in the chat list
 * Handles both direct messages and group chats
 */
export function ChannelPreview({ channel, activeChatId, setActiveChatId }: { channel: ChannelOverview, activeChatId: UUID | null, setActiveChatId: (id: UUID | null) => void }) {

  const isActive = activeChatId === channel.id;
  const hasUnreadMessages = !isActive && channel.unread_count > 0;

  return (
    <Link
      href={`/chats/${channel.type === ChannelType.DIRECT_MESSAGE ? 'dms' : 'groups'}/${channel.id}`}
      className="block"
      onClick={() => setActiveChatId(channel.id)}
    >
      <div className={cn(
        "flex items-center p-4 hover:bg-accent rounded-lg cursor-pointer w-full max-w-5xl",
        isActive && "bg-accent/80"
      )}>
        <img
          src={channel.image || (channel.type === ChannelType.DIRECT_MESSAGE ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${channel.name}` : `https://api.dicebear.com/9.x/initials/svg?seed=${channel.name}`)}
          alt={channel.name}
          className="w-14 h-14 rounded-full mr-4"
        />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-lg">{channel.name}</h3>
            {!isActive && channel.last_chat && (
              <span className="text-sm text-muted-foreground">
                {formatTime(channel.last_chat.created_at)}
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
                <MessagePreview lastChat={channel.last_chat} channelId={channel.id} />
                {hasUnreadMessages && (
                  <span className="bg-primary text-primary-foreground rounded-full px-2.5 py-1 text-sm shrink-0">
                    {channel.unread_count}
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