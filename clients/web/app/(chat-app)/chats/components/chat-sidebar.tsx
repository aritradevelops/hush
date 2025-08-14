import { ChatFilters, FilterType } from '@/app/(chat-app)/chats/components/chat-filters';
import { ChatHeader } from './chat-header';
import { ChatListContent } from './chat-list-content';
import { UUID } from 'crypto';
import { useScreen } from '@/contexts/screen-context';
import { cn } from '@/lib/utils';

interface ChatSidebarProps {
  activeFilter: FilterType;
  setActiveFilter: (filter: FilterType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  openModal: (modal: 'add-contact' | 'create-group' | null) => void;
  isLoading: boolean;
  channels: any[];
  pinnedChats: any[];
  activeChatId: UUID | null;
  setActiveChatId: (id: UUID | null) => void;
}

export const ChatSidebar = ({
  activeFilter,
  setActiveFilter,
  searchQuery,
  setSearchQuery,
  openModal,
  isLoading,
  channels,
  pinnedChats,
  activeChatId,
  setActiveChatId
}: ChatSidebarProps) => {
  const { isMobile } = useScreen()
  return (
    <div className={cn("border-r flex flex-col h-full", isMobile ? 'w-full' : 'w-[400px]')}>
      <div className="p-4">
        <ChatHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          openModal={openModal}
        />
        <ChatFilters activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <ChatListContent
            isLoading={isLoading}
            channels={channels}
            pinnedChats={pinnedChats}
            activeFilter={activeFilter}
            activeChatId={activeChatId}
            setActiveChatId={setActiveChatId}
          />
        </div>
      </div>
    </div>
  );
};