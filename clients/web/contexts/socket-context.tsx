// lib/socket-context.tsx
import { ApiListResponseSuccess } from '@/types/api';
import { Chat, DirectMessage } from '@/types/entities';
import { SocketClientEmittedEvent, SocketServerEmittedEvent } from '@/types/events';
import { ReactQueryKeys } from '@/types/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { UUID } from 'crypto';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  addContact: (contactId: UUID, callback: (dm: DirectMessage) => void) => void;
  sendMessage: (channelId: UUID, encryptedMessage: string, iv: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socket = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Only create the socket if it doesn't exist
    if (!socket.current) {
      socket.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
        withCredentials: true,
      });

      socket.current.on(SocketServerEmittedEvent.CONNECT, () => {
        console.log('Connected to socket server');
        setIsConnected(true);
      });

      socket.current.on(SocketServerEmittedEvent.MESSAGE_RECEIVED, (message: Chat) => {
        console.log('Message received', message);
        queryClient.setQueryData([ReactQueryKeys.DIRECT_MESSAGES_CHATS, message.channel_id],
          (oldData: { pages: ApiListResponseSuccess<Chat>[], pageParams: number[] }) => {
            return {
              pages: [{ ...oldData.pages[0], data: [message, ...oldData.pages[0].data] }],
              pageParams: oldData.pageParams
            }
          }
        );
      });

      socket.current.on(SocketServerEmittedEvent.DISCONNECT, () => {
        console.log('Disconnected from socket server');
        setIsConnected(false);
      });
    }

    // Cleanup function
    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
        setIsConnected(false);
      }
    };
  }, [queryClient]);

  const addContact = (contactId: UUID, callback: (dm: DirectMessage) => void) => {
    if (!socket.current) return;
    socket.current.emit(SocketClientEmittedEvent.CONTACT_ADD, { contact_id: contactId }, (dm: DirectMessage) => {
      callback(dm);
    });
  };

  const sendMessage = (channelId: UUID, encryptedMessage: string, iv: string) => {
    if (!socket.current) return;
    socket.current.emit(SocketClientEmittedEvent.MESSAGE_SEND, {
      channel_id: channelId,
      encrypted_message: encryptedMessage,
      iv
    });
  };

  const value = {
    socket: socket.current,
    isConnected,
    addContact,
    sendMessage,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}