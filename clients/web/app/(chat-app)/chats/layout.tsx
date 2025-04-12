'use client'
import { AddContactModal } from '@/app/(chat-app)/chats/components/add-contact-modal';
import { ChatFilters, FilterType } from '@/app/(chat-app)/chats/components/chat-filters';
import { ChannelPreview } from '@/app/(chat-app)/chats/components/channel-preview';
import { ChatListSkeleton } from '@/app/(chat-app)/chats/components/chat-list-skeleton';
import { ChatOptions } from '@/app/(chat-app)/chats/components/chat-options';
import { ChatSearchBar } from '@/app/(chat-app)/chats/components/chat-search-bar';
import { CreateGroupModal } from '@/app/(chat-app)/chats/components/create-group-modal';
import { EncryptionKeyModal } from '@/app/(chat-app)/chats/components/encryption-key-modal';
import { useChannels } from '@/hooks/use-channels';
import { UUID } from 'crypto';
import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function ChatsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const chatId = params.id as UUID
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModal, setActiveModal] = useState<'add-contact' | 'create-group' | null>(null);
  const [activeChatId, setActiveChatId] = useState<UUID | null>(chatId || null);
  const { data: channels, isLoading: isLoadingChannels, isError: isErrorChannels } = useChannels(activeFilter, searchQuery, activeChatId);
  const pinnedChats = channels?.filter(c => c.has_pinned);

  return (
    <div className="flex-1 flex">
      <div className="w-[400px] border-r flex flex-col h-full">
        <div className="p-4">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Hush</h1>
              <ChatOptions openModal={setActiveModal} />
            </div>
            <ChatSearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          </div>
          <ChatFilters activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {isLoadingChannels ? (
              <ChatListSkeleton />
            ) : (
              <>
                {(pinnedChats && pinnedChats.length) ? (
                  <div className="mb-6">
                    <h2 className="text-sm font-medium text-muted-foreground mb-2">Pinned Chats</h2>
                    <div className="space-y-2">
                      {pinnedChats.map((channel) => (
                        <ChannelPreview key={channel.id} channel={channel} activeChatId={activeChatId} setActiveChatId={setActiveChatId} />
                      ))}
                    </div>
                  </div>
                ) : null}

                {channels && channels.length > 0 ? (
                  <div>
                    <h2 className="text-sm font-medium text-muted-foreground mb-2">
                      {activeFilter === 'all' ? 'All Chats' : activeFilter === 'unread' ? 'Unread' : 'Groups'}
                    </h2>
                    <div className="space-y-2">
                      {channels.map((channel) => (
                        <ChannelPreview key={channel.id} channel={channel} activeChatId={activeChatId} setActiveChatId={setActiveChatId} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No chats found, please add a contact
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {children}
      <AddContactModal
        isOpen={activeModal === 'add-contact'}
        onClose={() => setActiveModal(null)}
      />
      <CreateGroupModal
        isOpen={activeModal === 'create-group'}
        onClose={() => setActiveModal(null)}
      />
      <EncryptionKeyModal />
    </div>
  );
}