import { useEffect } from 'react';
import { useSocket } from '@/contexts/socket-context';
import { useMe } from '@/contexts/user-context';
import { useQueryClient } from '@tanstack/react-query';
import { SocketClientEmittedEvent, SocketServerEmittedEvent } from '@/types/events';
import { Chat, User, UserChatInteraction, UserChatInteractionStatus } from '@/types/entities';
import { ReactQueryKeys } from '@/types/react-query';
import { ApiListResponseSuccess } from '@/types/api';
import { UUID } from 'crypto';

export const useChatSocket = (activeChatId: UUID | null) => {
  const { socket } = useSocket();
  const { user } = useMe();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    socket.emit(SocketClientEmittedEvent.CHANNEL_SEEN, { channel_id: activeChatId });
    console.debug('emitting channel seen', activeChatId);

    function updateMessageStatus(message: Chat, ucis?: UserChatInteraction[]) {
      queryClient.setQueryData([ReactQueryKeys.DIRECT_MESSAGES_CHATS, message.channel_id],
        (oldData: { pages: ApiListResponseSuccess<Chat & { ucis?: UserChatInteraction[] }>[], pageParams: number[] }) => {
          if (!oldData?.pages) return oldData;

          let foundPageIndex = -1;
          let foundMessageIndex = -1;

          oldData.pages.forEach((page, pageIndex) => {
            const msgIndex = page.data.findIndex(m => m.id === message.id);
            if (msgIndex !== -1) {
              foundPageIndex = pageIndex;
              foundMessageIndex = msgIndex;
            }
          });

          if (foundPageIndex === -1) return oldData;

          const updatedPages = oldData.pages.map((page, pageIndex) => {
            if (pageIndex !== foundPageIndex) return page;

            const updatedMessages = [...page.data];
            updatedMessages[foundMessageIndex] = {
              ...updatedMessages[foundMessageIndex],
              ucis: ucis
            };

            return { ...page, data: updatedMessages };
          });

          return {
            pages: updatedPages,
            pageParams: oldData.pageParams
          };
        }
      );
    }

    function onMessage(message: Chat & { ucis: UserChatInteraction[] }, cb: ({ status, event }: { status: UserChatInteractionStatus, event: string }) => void) {
      console.debug('new message received', message, message.channel_id, activeChatId);

      if (message.created_by === user.id && message.channel_id === activeChatId) {
        updateMessageStatus(message, message.ucis);
      } else {
        if (message.channel_id !== activeChatId) {
          console.debug('emitting delivered');
          cb({ status: UserChatInteractionStatus.DELIVERED, event: 'delivered' });
          queryClient.invalidateQueries({ queryKey: [ReactQueryKeys.CHANNEL_OVERVIEW] });
        } else {
          console.debug('emitting seen', UserChatInteractionStatus.SEEN);
          cb({ status: UserChatInteractionStatus.SEEN, event: 'seen' });
          queryClient.setQueryData([ReactQueryKeys.DIRECT_MESSAGES_CHATS, message.channel_id],
            (oldData: { pages: ApiListResponseSuccess<Chat & { ucis: UserChatInteractionStatus[] }>[], pageParams: number[] }) => {
              return {
                pages: [{ ...oldData.pages[0], data: [message, ...oldData.pages[0].data] }],
                pageParams: oldData.pageParams
              };
            }
          );
        }
      }
    }

    function updateSpecificMessageStatus(message: UserChatInteraction & { chat_id: UUID }, status: UserChatInteractionStatus) {
      queryClient.setQueryData([ReactQueryKeys.DIRECT_MESSAGES_CHATS, message.channel_id],
        (oldData: { pages: ApiListResponseSuccess<Chat & { ucis?: UserChatInteraction[] }>[], pageParams: number[] }) => {
          if (!oldData?.pages) return oldData;

          let foundPageIndex = -1;
          let foundMessageIndex = -1;

          oldData.pages.forEach((page, pageIndex) => {
            const msgIndex = page.data.findIndex(m => m.id === message.chat_id);
            if (msgIndex !== -1) {
              foundPageIndex = pageIndex;
              foundMessageIndex = msgIndex;
            }
          });

          if (foundPageIndex === -1) return oldData;

          const updatedPages = oldData.pages.map((page, pageIndex) => {
            if (pageIndex !== foundPageIndex) return page;

            const updatedMessages = [...page.data];
            updatedMessages[foundMessageIndex] = {
              ...updatedMessages[foundMessageIndex],
              ucis: updatedMessages[foundMessageIndex].ucis?.map(uci => {
                if (uci.created_by === message.updated_by || uci.updated_by === message.updated_by) {
                  console.debug('updating uci', typeof status);
                  return {
                    ...uci,
                    status: status,
                    updated_at: message.updated_at,
                    updated_by: message.updated_by
                  };
                }
                return { ...uci };
              })
            };

            return { ...page, data: updatedMessages };
          });

          return {
            pages: updatedPages,
            pageParams: oldData.pageParams
          };
        }
      );
    }

    function onMessageDelivered(message: UserChatInteraction & { chat_id: UUID }) {
      console.debug('message delivered', message);
      if (message.channel_id !== activeChatId) return;
      updateSpecificMessageStatus(message, UserChatInteractionStatus.DELIVERED);
    }

    function onMessageSeen(message: UserChatInteraction & { chat_id: UUID }) {
      console.debug('message seen', message);
      if (message.channel_id !== activeChatId) return;
      updateSpecificMessageStatus(message, UserChatInteractionStatus.SEEN);
    }

    socket.on(SocketServerEmittedEvent.MESSAGE_RECEIVED, onMessage);
    socket.on(SocketServerEmittedEvent.MESSAGE_DELIVERED, onMessageDelivered);
    socket.on(SocketServerEmittedEvent.MESSAGE_SEEN, onMessageSeen);

    return () => {
      socket.off(SocketServerEmittedEvent.MESSAGE_RECEIVED, onMessage);
      socket.off(SocketServerEmittedEvent.MESSAGE_DELIVERED, onMessageDelivered);
      socket.off(SocketServerEmittedEvent.MESSAGE_SEEN, onMessageSeen);
    };
  }, [socket, queryClient, activeChatId, user.id]);
};