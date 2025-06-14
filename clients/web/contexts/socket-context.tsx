// lib/socket-context.tsx
import { Channel, Chat, Group } from '@/types/entities';
import { SocketClientEmittedEvent, SocketServerEmittedEvent } from '@/types/events';
import { useQueryClient } from '@tanstack/react-query';
import { UUID } from 'crypto';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { constants } from '@/config/constants';


export type NewChatPaylod = Pick<Chat, 'id' | 'channel_id' | 'encrypted_message' | 'iv' | 'created_at'>

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  addContact: (contactId: UUID, callback: (dm: Channel) => void) => void;
  sendMessage: (chat: NewChatPaylod) => void;
  emitTypingStart: (channelId: UUID) => void;
  emitTypingStop: (channelId: UUID) => void;
  emitChannelSeen: (channelId: UUID) => void;
  createGroup: (data: { name: string, description?: string, memberIds: UUID[] }, callback?: (group: Channel) => void) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socket = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Only create the socket if it doesn't exist
    if (!socket.current) {
      socket.current = io(constants.SERVER_URL, {
        withCredentials: true,
      });

      socket.current.on(SocketServerEmittedEvent.CONNECT, () => {
        console.log('Connected to socket server');
        setIsConnected(true);
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

  const addContact = (contactId: UUID, callback: (dm: Channel) => void) => {
    if (!socket.current) return;
    socket.current.emit(SocketClientEmittedEvent.CONTACT_ADD, { contact_id: contactId }, (dm: Channel) => {
      callback(dm);
    });
  };

  const sendMessage = (chat: NewChatPaylod) => {
    if (!socket.current) return;
    socket.current.emit(SocketClientEmittedEvent.MESSAGE_SEND, chat);
  };

  const createGroup = (data: { name: string, description?: string, memberIds: UUID[] }, callback?: (group: Channel) => void) => {
    if (!socket.current) return;
    socket.current.emit(SocketClientEmittedEvent.GROUP_CREATE, { ...data, member_ids: data.memberIds }, (group: Channel) => {
      if (callback) {
        callback(group)
      }
    });
  }
  const emitTypingStart = (channelId: UUID) => {
    if (!socket.current) return;
    socket.current.emit(SocketClientEmittedEvent.TYPING_START, { channel_id: channelId });
  };
  const emitTypingStop = (channelId: UUID) => {
    if (!socket.current) return;
    socket.current.emit(SocketClientEmittedEvent.TYPING_STOP, { channel_id: channelId });
  };

  const emitChannelSeen = (channelId: UUID) => {
    if (!socket.current) return;
    socket.current.emit(SocketClientEmittedEvent.CHANNEL_SEEN, { channel_id: channelId });
  };

  const value = {
    socket: socket.current,
    isConnected,
    addContact,
    sendMessage,
    emitTypingStart,
    emitTypingStop,
    createGroup,
    emitChannelSeen
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