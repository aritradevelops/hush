'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchChats, fetchPinnedChats, fetchUnreadChats } from './api';
import { Chat, GroupChat, PrivateChat } from './types';
import { useState, useEffect } from 'react';
import { Search, UserPlus, Users, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/use-socket';
import httpClient, { GroupChannel, PrivateChannel } from '@/lib/http-client';
import { UUID } from 'crypto';

type FilterType = 'all' | 'unread' | 'groups';

interface Contact {
  id: UUID;
  name: string;
  avatar: string;
  email: string;
}

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

function AddContactModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const response = await httpClient.fetchNewContacts([], searchQuery);
      return response.data;
    },
    enabled: !!searchQuery.trim(),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const addContactMutation = useMutation<{ id: UUID }, Error, UUID>({
    mutationFn: async (contactId: UUID) => {
      const channel = await httpClient.addContact(contactId);
      return channel;
    },
    onSuccess: (channel) => {
      // Invalidate and refetch chats to show the new contact
      queryClient.invalidateQueries({ queryKey: ['chats'] });

      // Navigate to the new chat
      if (channel?.id) {
        router.push(`/chats/${channel.id}`);
      }

      onClose();
    },
  });

  const handleAddContact = async (contactId: UUID) => {
    console.log('adding contact', contactId)
    addContactMutation.mutate(contactId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50">
      <div className="bg-card/95 rounded-lg w-[500px] max-h-[600px] flex flex-col shadow-xl border">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Add New Contact</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center p-4 rounded-lg bg-accent/50">
                  <div className="w-12 h-12 rounded-full bg-accent animate-pulse" />
                  <div className="flex-1 ml-4">
                    <div className="h-5 w-32 bg-accent rounded animate-pulse mb-2" />
                    <div className="h-4 w-48 bg-accent rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : contacts.length > 0 ? (
            <div className="space-y-2">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-accent/50 hover:bg-accent/70 transition-colors"
                >
                  <div className="flex items-center">
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="ml-4">
                      <h3 className="font-medium">{contact.name}</h3>
                      <p className="text-sm text-muted-foreground">{contact.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddContact(contact.id)}
                    disabled={addContactMutation.isPending}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {addContactMutation.isPending ? 'Adding...' : 'Add'}
                  </button>
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-center text-muted-foreground py-8">
              No contacts found
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Search for contacts to add
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Pinned Chats Skeleton */}
      <div className="mb-6">
        <div className="h-4 w-24 bg-accent rounded animate-pulse mb-2" />
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center p-4 rounded-lg bg-accent/50">
              <div className="w-14 h-14 rounded-full bg-accent animate-pulse" />
              <div className="flex-1 ml-4">
                <div className="h-5 w-32 bg-accent rounded animate-pulse mb-2" />
                <div className="h-4 w-48 bg-accent rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Chats Skeleton */}
      <div>
        <div className="h-4 w-24 bg-accent rounded animate-pulse mb-2" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center p-4 rounded-lg bg-accent/50">
              <div className="w-14 h-14 rounded-full bg-accent animate-pulse" />
              <div className="flex-1 ml-4">
                <div className="h-5 w-32 bg-accent rounded animate-pulse mb-2" />
                <div className="h-4 w-48 bg-accent rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChatItem({ chat }: { chat: GroupChannel | PrivateChannel }) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Link href={`/chats/${chat.id}`} className="block">
      <div className="flex items-center p-4 hover:bg-accent rounded-lg cursor-pointer w-full max-w-5xl">
        <img
          src={chat.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.name}`}
          alt={chat.name}
          className="w-14 h-14 rounded-full mr-4"
        />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-lg">{chat.name}</h3>
            {chat.last_chat && (<span className="text-sm text-muted-foreground">
              {formatTime(chat.last_chat.created_at)}
            </span>)}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {chat.last_chat ? (<p className="text-sm text-muted-foreground truncate flex-1">
              <span className="font-medium text-foreground">
                {chat.last_chat.sender}:
              </span>
              {' '}
              {chat.last_chat.message}
            </p>) : <p className="text-sm text-muted-foreground truncate flex-1">Type your first message..</p>}
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

export default function ChatsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const { isConnected, onNewChannel } = useSocket();
  const queryClient = useQueryClient();

  const { data: allChats, isLoading: isLoadingChats } = useQuery({
    queryKey: ['chats'],
    queryFn: (c) => httpClient.getAllChannels('')
  });
  const pinnedChats = allChats ? allChats.filter(c => c.is_pinned) : [];
  const unreadChats = allChats ? allChats.filter(c => c.unread_count) : []
  // Handle new channel events
  useEffect(() => {
    const cleanup = onNewChannel((channel) => {
      // Update the chats list with the new channel
      queryClient.setQueryData(['chats'], (oldData: Chat[] | undefined) => {
        if (!oldData) return [channel];
        // Check if channel already exists
        if (oldData.some(chat => chat.id === channel.id)) return oldData;
        // Add new channel to the beginning of the list
        return [channel, ...oldData];
      });

      // Update pinned chats if needed
      queryClient.setQueryData(['pinned-chats'], (oldData: Chat[] | undefined) => {
        if (!oldData) return [];
        // Check if channel already exists in pinned chats
        if (oldData.some(chat => chat.id === channel.id)) return oldData;
        return oldData;
      });

      // Update unread chats if needed
      queryClient.setQueryData(['unread-chats'], (oldData: Chat[] | undefined) => {
        if (!oldData) return [];
        // Check if channel already exists in unread chats
        if (oldData.some(chat => chat.id === channel.id)) return oldData;
        return oldData;
      });
    });

    return () => {
      cleanup?.();
    };
  }, [onNewChannel, queryClient]);

  const getFilteredChats = () => {
    const chats = allChats || [];
    let filtered = chats;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(chat =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase())
        // || chat.last_message.message.toLowerCase().includes(searchQuery.toLowerCase())
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
    <div className="flex-1 flex">
      <div className="w-[400px] border-r flex flex-col h-full">
        <div className="p-4">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Hush</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsAddContactModalOpen(true)}
                  className="p-2 rounded-lg bg-accent hover:bg-accent/80 transition-colors cursor-pointer"
                  title="Add New Contact"
                >
                  <UserPlus className="h-5 w-5" />
                </button>
                <button
                  className="p-2 rounded-lg bg-accent hover:bg-accent/80 transition-colors cursor-pointer"
                  title="Create Group"
                >
                  <Users className="h-5 w-5" />
                </button>
              </div>
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
            {isLoadingChats ? (
              <ChatListSkeleton />
            ) : (
              <>
                {pinnedChats.length ? (
                  <div className="mb-6">
                    <h2 className="text-sm font-medium text-muted-foreground mb-2">Pinned Chats</h2>
                    <div className="space-y-2">
                      {pinnedChats.filter(c => c.is_pinned).map((chat) => (
                        <ChatItem key={chat.id} chat={chat} />
                      ))}
                    </div>
                  </div>
                ) : <></>}

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
              </>
            )}
          </div>
        </div>
      </div>
      {children}
      <AddContactModal
        isOpen={isAddContactModalOpen}
        onClose={() => setIsAddContactModalOpen(false)}
      />
    </div>
  )
}