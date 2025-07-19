'use client'
import { useChannels } from '@/hooks/use-channels';
import { UUID } from 'crypto';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { FilterType } from '@/app/(chat-app)/chats/components/chat-filters';
import { useChatSocket } from '@/hooks/use-chat-socket';
import { ChatSidebar } from '@/app/(chat-app)/chats/components/chat-sidebar';
import { ChatModals } from '@/app/(chat-app)/chats/components/chat-modals';
import { useCall } from '@/contexts/call-context';
import { IncomingCallModal } from './components/show-incoming-call';

export default function ChatsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams();
  const chatId = params.id as UUID;
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModal, setActiveModal] = useState<'add-contact' | 'create-group' | null>(null);
  const [activeChatId, setActiveChatId] = useState<UUID | null>(chatId || null);

  const { data: channels, isLoading: isLoadingChannels } = useChannels(activeFilter, searchQuery, activeChatId);
  const pinnedChats = channels?.filter(c => c.has_pinned);
  useChatSocket(activeChatId);

  return (
    <div className="flex-1 flex">
      <ChatSidebar
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        openModal={setActiveModal}
        isLoading={isLoadingChannels}
        channels={channels || []}
        pinnedChats={pinnedChats || []}
        activeChatId={activeChatId}
        setActiveChatId={setActiveChatId}
      />
      {children}
      <ChatModals activeModal={activeModal} setActiveModal={setActiveModal} />
      <IncomingCallModal />
    </div>
  );
}