import { DirectMessage } from '@/types/entities';
import { SocketEvent } from '@/types/events';
import { UUID } from 'crypto';
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

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

  const addContact = (contactId: UUID, callback: (dm: DirectMessage) => void) => {
    if (!socket.current) return;
    socket.current.emit(SocketEvent.CONTACT_ADD, { contact_id: contactId }, (dm: DirectMessage) => {
      callback(dm);
    });
  };
  const sendMessage = (channelId: UUID, encryptedMessage: string, iv: string) => {
    if (!socket.current) return;
    socket.current.emit(SocketEvent.MESSAGE_SEND, { channel_id: channelId, encrypted_message: encryptedMessage, iv });
  }

  return {
    socket: socket.current,
    isConnected: socket.current?.connected || false,
    addContact,
    sendMessage,
  };
}