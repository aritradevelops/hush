'use client'
import { AddContactModal } from '@/app/(chat-app)/chats/components/add-contact-modal';
import { ChatFilters, FilterType } from '@/app/(chat-app)/chats/components/chat-filters';
import { ChannelPreview } from '@/app/(chat-app)/chats/components/channel-preview';
import { ChatListSkeleton } from '@/app/(chat-app)/chats/components/chat-list-skeleton';
import { ChatOptions } from '@/app/(chat-app)/chats/components/chat-options';
import { ChatSearchBar } from '@/app/(chat-app)/chats/components/chat-search-bar';
import { CreateGroupModal } from '@/app/(chat-app)/chats/components/create-group-modal';
import { EncryptionKeyModal } from '@/app/(chat-app)/chats/components/encryption-key-modal';
import Conference from '@/app/(chat-app)/chats/components/conference';
import { useChannels } from '@/hooks/use-channels';
import { UUID } from 'crypto';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSocket } from '@/contexts/socket-context';
import { SocketClientEmittedEvent, SocketServerEmittedEvent } from '@/types/events';
import { Chat, User, UserChatInteraction, UserChatInteractionStatus } from '@/types/entities';
import { useMe } from '@/contexts/user-context';
import { useQueryClient } from '@tanstack/react-query';
import { ReactQueryKeys } from '@/types/react-query';
import { ApiListResponseSuccess } from '@/types/api';
import { useCall } from '@/hooks/use-call';
import { IncomingCallModal } from './components/show-incoming-call-modal';

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
  const { socket } = useSocket()
  const { user } = useMe()
  const { callStatus, showIncomingCallModal } = useCall()
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return

    socket.emit(SocketClientEmittedEvent.CHANNEL_SEEN, { channel_id: activeChatId })
    // console.log('emitting channel seen', activeChatId)
    function updateMessageStatus(message: Chat, ucis?: UserChatInteraction[]) {
      queryClient.setQueryData([ReactQueryKeys.DIRECT_MESSAGES_CHATS, message.channel_id],
        (oldData: { pages: ApiListResponseSuccess<Chat & { ucis?: UserChatInteraction[] }>[], pageParams: number[] }) => {
          if (!oldData?.pages) return oldData;

          // Search through all pages to find the message
          let foundPageIndex = -1;
          let foundMessageIndex = -1;

          oldData.pages.forEach((page, pageIndex) => {
            const msgIndex = page.data.findIndex(m => m.id === message.id);
            if (msgIndex !== -1) {
              foundPageIndex = pageIndex;
              foundMessageIndex = msgIndex;
            }
          });
          // If message not found in any page, return unchanged
          if (foundPageIndex === -1) return oldData;

          // Create new pages array with the updated message
          const updatedPages = oldData.pages.map((page, pageIndex) => {
            if (pageIndex !== foundPageIndex) return page;

            const updatedMessages = [...page.data];
            updatedMessages[foundMessageIndex] = {
              ...updatedMessages[foundMessageIndex],
              ucis: ucis
            };

            return { ...page, data: updatedMessages };
          });

          // Return new reference for the entire structure
          return {
            pages: updatedPages,
            pageParams: oldData.pageParams
          }
        }
      );
    }

    function onMessage(message: Chat & { ucis: UserChatInteraction[] }, cb: ({ status, event }: { status: UserChatInteractionStatus, event: string }) => void) {
      // console.log('new message received', message, message.channel_id, activeChatId)
      // if the message was sent by me then mark it as sent
      if (message.created_by === user.id && message.channel_id === activeChatId) {
        updateMessageStatus(message, message.ucis)
      }
      else {
        // if the message was not part of active chat then mark it as delivered
        if (message.channel_id !== activeChatId) {
          // console.log('emitting delivered')
          cb({ status: UserChatInteractionStatus.DELIVERED, event: 'delivered' })
          // increase the unread count of the channel
          queryClient.invalidateQueries({ queryKey: [ReactQueryKeys.CHANNEL_OVERVIEW] })
        } else {
          // console.log('emitting seen', UserChatInteractionStatus.SEEN)
          cb({ status: UserChatInteractionStatus.SEEN, event: 'seen' })
          // append the message to the body and mark it as seen
          queryClient.setQueryData([ReactQueryKeys.DIRECT_MESSAGES_CHATS, message.channel_id],
            (oldData: { pages: ApiListResponseSuccess<Chat & { ucis: UserChatInteractionStatus[] }>[], pageParams: number[] }) => {
              // update the message in the cache
              return {
                pages: [{ ...oldData.pages[0], data: [message, ...oldData.pages[0].data] }],
                pageParams: oldData.pageParams
              }
            }
          );
        }
      }
    }

    function updateSpecificMessageStatus(message: UserChatInteraction & { chat_id: UUID }, status: UserChatInteractionStatus) {
      queryClient.setQueryData([ReactQueryKeys.DIRECT_MESSAGES_CHATS, message.channel_id],
        (oldData: { pages: ApiListResponseSuccess<Chat & { ucis?: UserChatInteraction[] }>[], pageParams: number[] }) => {
          if (!oldData?.pages) return oldData;

          // Search through all pages to find the message
          let foundPageIndex = -1;
          let foundMessageIndex = -1;

          oldData.pages.forEach((page, pageIndex) => {
            const msgIndex = page.data.findIndex(m => m.id === message.chat_id);
            if (msgIndex !== -1) {
              foundPageIndex = pageIndex;
              foundMessageIndex = msgIndex;
            }
          });
          // console.log(`found message index ${foundPageIndex} : ${foundMessageIndex}`)
          // If message not found in any page, return unchanged
          if (foundPageIndex === -1) return oldData;

          // Create new pages array with the updated message
          const updatedPages = oldData.pages.map((page, pageIndex) => {
            if (pageIndex !== foundPageIndex) return page;

            const updatedMessages = [...page.data];
            updatedMessages[foundMessageIndex] = {
              ...updatedMessages[foundMessageIndex],
              ucis: updatedMessages[foundMessageIndex].ucis?.map(uci => {
                if (uci.created_by === message.updated_by || uci.updated_by === message.updated_by) {
                  // console.log('updating uci', typeof status)
                  return {
                    ...uci,
                    status: status,
                    updated_at: message.updated_at,
                    updated_by: message.updated_by
                  }
                }
                return { ...uci }
              })
            };

            return { ...page, data: updatedMessages };
          });

          // Return new reference for the entire structure
          return {
            pages: updatedPages,
            pageParams: oldData.pageParams
          }
        }
      );
    }
    function onMessageDelivered(message: UserChatInteraction & { chat_id: UUID }) {
      // console.log('message delivered', message)
      if (message.channel_id !== activeChatId) return
      updateSpecificMessageStatus(message, UserChatInteractionStatus.DELIVERED)
    }
    function onMessageSeen(message: UserChatInteraction & { chat_id: UUID }) {
      // console.log('message seen', message)
      if (message.channel_id !== activeChatId) return
      updateSpecificMessageStatus(message, UserChatInteractionStatus.SEEN)
    }

    socket.on(SocketServerEmittedEvent.MESSAGE_RECEIVED, onMessage)
    socket.on(SocketServerEmittedEvent.MESSAGE_DELIVERED, onMessageDelivered)
    socket.on(SocketServerEmittedEvent.MESSAGE_SEEN, onMessageSeen)
    return () => {
      socket.off(SocketServerEmittedEvent.MESSAGE_RECEIVED, onMessage)
      socket.off(SocketServerEmittedEvent.MESSAGE_DELIVERED, onMessageDelivered)
      socket.off(SocketServerEmittedEvent.MESSAGE_SEEN, onMessageSeen)
    }
  }, [socket, queryClient, activeChatId])

  return (
    <div className="flex-1 flex">
      {callStatus === 'ringing' && showIncomingCallModal && <IncomingCallModal />}
      {(callStatus === 'none' || callStatus === 'ringing') && (<div className="w-[400px] border-r flex flex-col h-full">
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
      </div>)}
      {callStatus === 'ongoing' && <Conference />}
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