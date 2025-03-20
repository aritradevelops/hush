'use client'
import { useQuery } from '@tanstack/react-query';
import { fetchChats, fetchPinnedChats, fetchUnreadChats } from './api';
import { Chat } from './types';
import { useState } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { ChatList } from './components/chat-list';

type FilterType = 'all' | 'unread' | 'groups';

export default function ChatsPage() {
  return (
    <div className="w-full flex h-screen">
      <ChatList />
      <div className="w-full flex-1 flex items-center justify-center">
        <div className="w-full max-w-2xl text-center px-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to Hush</h1>
          <p className="text-xl text-muted-foreground mb-12">
            Your private, secure messaging platform
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureCard
              title="End-to-End Encryption"
              description="Your messages are encrypted from start to finish, ensuring complete privacy."
              icon="🔒"
            />
            <FeatureCard
              title="Real-time Messaging"
              description="Send and receive messages instantly with real-time updates."
              icon="⚡"
            />
            <FeatureCard
              title="Group Chats"
              description="Create and manage group conversations with ease."
              icon="👥"
            />
            <FeatureCard
              title="Message Status"
              description="Know when your messages are delivered and read."
              icon="✓"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="p-6 rounded-lg bg-accent/50 hover:bg-accent/80 transition-colors">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function ChatItem({ chat }: { chat: Chat }) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Link href={`/chats/${chat.id}`} className="block">
      <div className="flex items-center p-4 hover:bg-accent rounded-lg cursor-pointer w-full max-w-5xl">
        <img
          src={chat.avatar}
          alt={chat.name}
          className="w-14 h-14 rounded-full mr-4"
        />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-lg">{chat.name}</h3>
            <span className="text-sm text-muted-foreground">
              {formatTime(chat.last_message.created_at)}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-muted-foreground truncate flex-1">
              <span className="font-medium text-foreground">
                {chat.last_message.sender.name}:
              </span>
              {' '}
              {chat.last_message.message}
            </p>
            {chat.unread_count > 0 && (
              <span className="bg-primary text-primary-foreground rounded-full px-2.5 py-1 text-sm shrink-0">
                {chat.unread_count}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}


