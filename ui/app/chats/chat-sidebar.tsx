'use client'
import { Input } from '@/components/ui/input';
import { MoveLeft, Search } from 'lucide-react';
import { JSX, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// TypeScript interfaces
interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: Date;
  isRead: boolean;
  unreadCount: number;
}

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface ContactListProps {
  contacts: Contact[];
  selectedContactId: string | null;
  setSelectedContactId: (id: string) => void;
}

interface ContactItemProps {
  contact: Contact;
  isSelected: boolean;
  onClick: () => void;
}

// Sample data
const contacts: Contact[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: '/api/placeholder/32/32',
    lastMessage: 'Hey, are we still meeting at 2pm today?',
    timestamp: new Date(2025, 2, 10, 13, 45), // March 10, 2025, 1:45 PM
    isRead: false,
    unreadCount: 2
  },
  {
    id: '2',
    name: 'Alex Parker',
    avatar: '/api/placeholder/32/32',
    lastMessage: 'I sent you the design files. Check them out when you can.',
    timestamp: new Date(2025, 2, 10, 12, 30), // March 10, 2025, 12:30 PM
    isRead: true,
    unreadCount: 0
  },
  {
    id: '3',
    name: 'Work Group',
    avatar: '/api/placeholder/32/32',
    lastMessage: 'James: Let\'s discuss the project timeline tomorrow',
    timestamp: new Date(2025, 2, 10, 11, 15), // March 10, 2025, 11:15 AM
    isRead: true,
    unreadCount: 0
  },
  {
    id: '4',
    name: 'Lisa Wong',
    avatar: '/api/placeholder/32/32',
    lastMessage: 'Thanks for the help! Really appreciate it.',
    timestamp: new Date(2025, 2, 10, 9, 20), // March 10, 2025, 9:20 AM
    isRead: false,
    unreadCount: 1
  },
  {
    id: '5',
    name: 'David Miller',
    avatar: '/api/placeholder/32/32',
    lastMessage: 'I\'ll be there in 10 minutes.',
    timestamp: new Date(2025, 2, 9, 18, 5), // March 9, 2025, 6:05 PM
    isRead: true,
    unreadCount: 0
  },
  {
    id: '6',
    name: 'Family Group',
    avatar: '/api/placeholder/32/32',
    lastMessage: 'Mom: Who\'s bringing dessert to dinner on Sunday?',
    timestamp: new Date(2025, 2, 9, 15, 42), // March 9, 2025, 3:42 PM
    isRead: false,
    unreadCount: 3
  },
  {
    id: '7',
    name: 'Michael Chen',
    avatar: '/api/placeholder/32/32',
    lastMessage: 'The presentation went well. Client loved our ideas!',
    timestamp: new Date(2025, 2, 8, 14, 30), // March 8, 2025, 2:30 PM
    isRead: true,
    unreadCount: 0
  },
  {
    id: '8',
    name: 'Emma Davis',
    avatar: '/api/placeholder/32/32',
    lastMessage: 'Can you share that recipe we talked about?',
    timestamp: new Date(2025, 2, 8, 10, 15), // March 8, 2025, 10:15 AM
    isRead: true,
    unreadCount: 0
  },
  {
    id: '9',
    name: 'Emma Davis',
    avatar: '/api/placeholder/32/32',
    lastMessage: 'Can you share that recipe we talked about?',
    timestamp: new Date(2025, 2, 8, 10, 15), // March 8, 2025, 10:15 AM
    isRead: true,
    unreadCount: 0
  }
];

export default function ChatSidebar(): JSX.Element {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  // Filter contacts based on active tab
  const filteredContacts = contacts.filter(contact => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return contact.unreadCount > 0;
    if (activeTab === 'favorites') return false; // Would need favorites data
    if (activeTab === 'groups') return contact.name.includes('Group');
    return true;
  });

  return (
    <div className='w-full h-full bg-primary/10 sm:w-1/3 sm:max-w flex flex-col'>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <ContactList
        contacts={filteredContacts}
        selectedContactId={selectedContactId}
        setSelectedContactId={setSelectedContactId}
      />
    </div>
  );
}

function Header({ activeTab, setActiveTab }: HeaderProps): JSX.Element {
  return (
    <div className='w-full p-4 flex flex-col gap-4'>
      <h1 className='text-2xl font-bold'>Chats</h1>
      <SearchBar />
      <FilterTabs activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

function SearchBar(): JSX.Element {
  const [hasText, setHasText] = useState<boolean>(false);

  return (
    <div className='relative'>
      <div className="absolute left-3 top-[50%] -translate-y-1/2 h-4 w-4 overflow-hidden">
        <div className={`relative h-4 w-4 transition-all duration-300 transform ${hasText ? 'rotate-180' : 'rotate-0'}`}>
          {hasText ? (
            <MoveLeft className="absolute h-4 w-4 text-muted-foreground" />
          ) : (
            <Search className="absolute h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>
      <Input
        type="text"
        placeholder="Search for contacts..."
        className="pl-10 transition-all duration-300"
        onChange={(e) => setHasText(e.target.value.length > 0)}
      />
    </div>
  );
}

function FilterTabs({ activeTab, setActiveTab }: HeaderProps): JSX.Element {
  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'favorites', label: 'Favorites' },
    { id: 'groups', label: 'Groups' }
  ];

  return (
    <div className="flex w-full">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 py-3 text-sm font-medium transition-colors duration-200  cursor-pointer
            ${activeTab === tab.id
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-primary/80 hover:bg-primary/5'
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function ContactList({ contacts, selectedContactId, setSelectedContactId }: ContactListProps): JSX.Element {
  return (
    <ScrollArea className="overflow-y-auto overflow-x-clip">
      <div className="px-2">
        {contacts.map((contact) => (
          <ContactItem
            key={contact.id}
            contact={contact}
            isSelected={contact.id === selectedContactId}
            onClick={() => setSelectedContactId(contact.id)}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

function ContactItem({ contact, isSelected, onClick }: ContactItemProps): JSX.Element {
  // Format timestamp to show only time
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    // TODO: fix this 70% thing
    <div
      className={`p-3 rounded-lg mb-1 flex cursor-pointer transition-colors w-[70%]
        ${isSelected ? 'bg-primary/20' : 'hover:bg-primary/10'}`}
      onClick={onClick}
    >
      {/* Avatar */}
      <div className="relative mr-3">
        <Avatar>
          <AvatarImage src={contact.avatar} alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        {!contact.isRead && (
          <div className="absolute -bottom-1 -right-1 bg-green-500 h-3 w-3 rounded-full border-2 border-white"></div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h3 className={`text-sm font-medium truncate ${!contact.isRead ? 'font-bold' : ''}`}>
            {contact.name}
          </h3>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatTime(contact.timestamp)}
          </span>
        </div>

        <div className="flex justify-between items-center mt-1">
          <p className={`text-xs truncate text-muted-foreground ${!contact.isRead ? 'font-medium text-foreground' : ''}`}>
            {contact.lastMessage}
          </p>

          {contact.unreadCount > 0 && (
            <Badge variant="default" className="ml-2 rounded-full h-5 w-5 flex items-center justify-center p-0 text-xs">
              {contact.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}