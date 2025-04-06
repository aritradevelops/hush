'use client'
import { AddContactModal } from '@/app/(chat-app)/chats/components/add-contact-modal';
import { CreateGroupModal } from '@/app/(chat-app)/chats/components/create-group-modal';
import { ChatFilters, FilterType } from '@/app/(chat-app)/chats/components/chat-filters';
import { ChatItem } from '@/app/(chat-app)/chats/components/chat-item';
import { ChatListSkeleton } from '@/app/(chat-app)/chats/components/chat-list-skeleton';
import { ChatOptions } from '@/app/(chat-app)/chats/components/chat-options';
import { ChatSearchBar } from '@/app/(chat-app)/chats/components/chat-search-bar';
import { EncryptionKeyModal } from '@/app/(chat-app)/chats/components/encryption-key-modal';
import { useChats } from '@/hooks/use-chats';
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
  const { data: chats, isLoading: isLoadingChats, isError: isErrorChats } = useChats(activeFilter, searchQuery);
  const pinnedChats = chats?.filter(c => c.isPinned);

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
            {isLoadingChats ? (
              <ChatListSkeleton />
            ) : (
              <>
                {(pinnedChats && pinnedChats.length) ? (
                  <div className="mb-6">
                    <h2 className="text-sm font-medium text-muted-foreground mb-2">Pinned Chats</h2>
                    <div className="space-y-2">
                      {pinnedChats.map((chat) => (
                        <ChatItem key={chat.id} chat={chat} activeChatId={activeChatId} setActiveChatId={setActiveChatId} />
                      ))}
                    </div>
                  </div>
                ) : null}

                {chats && chats.length > 0 ? (
                  <div>
                    <h2 className="text-sm font-medium text-muted-foreground mb-2">
                      {activeFilter === 'all' ? 'All Chats' : activeFilter === 'unread' ? 'Unread' : 'Groups'}
                    </h2>
                    <div className="space-y-2">
                      {chats.map((chat) => (
                        <ChatItem key={chat.id} chat={chat} activeChatId={activeChatId} setActiveChatId={setActiveChatId} />
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