import { ChannelPreview } from '@/app/(chat-app)/chats/components/channel-preview';
import { FilterType } from '@/app/(chat-app)/chats/components/chat-filters';
import { UUID } from 'crypto';

interface ChatListSectionProps {
  channels: any[];
  activeFilter: FilterType;
  activeChatId: UUID | null;
  setActiveChatId: (id: UUID | null) => void;
}

export const ChatListSection = ({ channels, activeFilter, activeChatId, setActiveChatId }: ChatListSectionProps) => {
  const getSectionTitle = () => {
    switch (activeFilter) {
      case 'all': return 'All Chats';
      case 'unread': return 'Unread';
      case 'groups': return 'Groups';
      default: return 'All Chats';
    }
  };

  if (!channels || channels.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No chats found, please add a contact
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-sm font-medium text-muted-foreground mb-2">
        {getSectionTitle()}
      </h2>
      <div className="space-y-2">
        {channels.map((channel) => (
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