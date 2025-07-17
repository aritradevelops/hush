import { ChannelPreview } from '@/app/(chat-app)/chats/components/channel-preview';
import { UUID } from 'crypto';

interface PinnedChatsSectionProps {
  pinnedChats: any[];
  activeChatId: UUID | null;
  setActiveChatId: (id: UUID | null) => void;
}

export const PinnedChatsSection = ({ pinnedChats, activeChatId, setActiveChatId }: PinnedChatsSectionProps) => {
  if (!pinnedChats || pinnedChats.length === 0) return null;

  return (
    <div className="mb-6">
      <h2 className="text-sm font-medium text-muted-foreground mb-2">Pinned Chats</h2>
      <div className="space-y-2">
        {pinnedChats.map((channel) => (
          <ChannelPreview
            key={channel.id}
            channel={channel}
            activeChatId={activeChatId}
            setActiveChatId={setActiveChatId}
          />
        ))}
      </div>
    </div>
  );
};