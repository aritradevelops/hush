import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { UUID } from 'crypto';

interface Channel {
  id: UUID;
  name: string;
  type: 'private' | 'group';
  avatar?: string;
  user_id: UUID;
  is_pinned: boolean;
  is_muted: boolean;
  search: string;
  is_pending: boolean;
  have_blocked: boolean;
  unread_count: string;
  been_blocked: boolean;
  last_chat: {
    id: UUID;
    message: string;
    iv: string;
    created_at: string;
    sender: string;
  } | null;
}

export function useSocket() {
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    socket.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      withCredentials: true,
    });

    socket.current.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.current.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  const addContact = async (contactId: UUID): Promise<Channel> => {
    return new Promise((resolve, reject) => {
      if (!socket.current) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.current.emit('add-contact', { contact_id: contactId }, (channel: Channel) => {
        if (channel) {
          resolve(channel);
        } else {
          reject(new Error('Failed to add contact'));
        }
      });
    });
  };

  const onNewChannel = (callback: (channel: Channel) => void) => {
    if (!socket.current) return;

    socket.current.on('new-channel', callback);

    return () => {
      socket.current?.off('new-channel', callback);
    };
  };

  return {
    socket: socket.current,
    isConnected: socket.current?.connected || false,
    addContact,
    onNewChannel,
  };
}