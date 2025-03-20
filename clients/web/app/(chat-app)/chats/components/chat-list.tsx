'use client'
import { useQuery } from '@tanstack/react-query';
import { fetchChats, fetchPinnedChats, fetchUnreadChats } from '../api';
import { Chat } from '../types';
import { useState } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';

type FilterType = 'all' | 'unread' | 'groups';

export function ChatList() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: allChats, isLoading: isLoadingChats } = useQuery({
    queryKey: ['chats'],
    queryFn: fetchChats
  });

  const { data: pinnedChats, isLoading: isLoadingPinned } = useQuery({
    queryKey: ['pinned-chats'],
    queryFn: fetchPinnedChats
  });

  const { data: unreadChats, isLoading: isLoadingUnread } = useQuery({
    queryKey: ['unread-chats'],
    queryFn: fetchUnreadChats
  });

  if (isLoadingChats || isLoadingPinned || isLoadingUnread) {
    return <div>Loading...</div>;
  }

  const getFilteredChats = () => {
    const chats = allChats || [];
    let filtered = chats;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(chat =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.last_message.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    switch (activeFilter) {
      case 'unread':
        return filtered.filter(chat => chat.unread_count > 0);
      case 'groups':
        return filtered.filter(chat => chat.type === 'group');
      default:
        return filtered;
    }
  };

  return (
    <div className="w-[400px] border-r flex flex-col h-full">
      <div className="p-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Hush</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-lg cursor-pointer ${activeFilter === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-accent hover:bg-accent/80'
              }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('unread')}
            className={`px-4 py-2 rounded-lg cursor-pointer ${activeFilter === 'unread'
              ? 'bg-primary text-primary-foreground'
              : 'bg-accent hover:bg-accent/80'
              }`}
          >
            Unread
          </button>
          <button
            onClick={() => setActiveFilter('groups')}
            className={`px-4 py-2 rounded-lg cursor-pointer ${activeFilter === 'groups'
              ? 'bg-primary text-primary-foreground'
              : 'bg-accent hover:bg-accent/80'
              }`}
          >
            Groups
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {pinnedChats && pinnedChats.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-medium text-muted-foreground mb-2">Pinned Chats</h2>
              <div className="space-y-2">
                {pinnedChats.map((chat) => (
                  <ChatItem key={chat.id} chat={chat} />
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-2">
              {activeFilter === 'all' ? 'All Chats' :
                activeFilter === 'unread' ? 'Unread Messages' : 'Group Chats'}
            </h2>
            <div className="space-y-2">
              {getFilteredChats().map((chat) => (
                <ChatItem key={chat.id} chat={chat} />
              ))}
            </div>
          </div>
        </div>
      </div>
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