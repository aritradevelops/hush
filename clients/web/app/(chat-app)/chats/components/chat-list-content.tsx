import { ChatListSkeleton } from '@/app/(chat-app)/chats/components/chat-list-skeleton';
import { PinnedChatsSection } from './pinned-chats-section';
import { ChatListSection } from './chat-list-section';
import { FilterType } from '@/app/(chat-app)/chats/components/chat-filters';
import { UUID } from 'crypto';

interface ChatListContentProps {
  isLoading: boolean;
  channels: any[];
  pinnedChats: any[];
  activeFilter: FilterType;
  activeChatId: UUID | null;
  setActiveChatId: (id: UUID | null) => void;
}

export const ChatListContent = ({
  isLoading,
  channels,
  pinnedChats,
  activeFilter,
  activeChatId,
  setActiveChatId
}: ChatListContentProps) => {
  if (isLoading) {
    return <ChatListSkeleton />;
  }

  return (
    <>
      <PinnedChatsSection
        pinnedChats={pinnedChats}
        activeChatId={activeChatId}
        setActiveChatId={setActiveChatId}
      />
      <ChatListSection
        channels={channels}
        activeFilter={activeFilter}
        activeChatId={activeChatId}
        setActiveChatId={setActiveChatId}
      />
    </>
  );
};