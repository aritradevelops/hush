import { Chat, PrivateChat, GroupChat } from './types';

// Sample data
const sampleChats: Chat[] = [
  {
    id: "1",
    name: "John Doe",
    type: "private",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    last_message: {
      id: "m1",
      message: "Hey, how are you?",
      created_at: "2024-03-20T10:00:00Z",
      sender: {
        id: "1",
        name: "John Doe"
      }
    },
    unread_count: 2,
    is_pinned: true,
    is_muted: false,
    have_blocked: false,
    been_blocked: false
  },
  {
    id: "2",
    name: "Jane Smith",
    type: "private",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
    last_message: {
      id: "m2",
      message: "See you tomorrow!",
      created_at: "2024-03-19T15:30:00Z",
      sender: {
        id: "2",
        name: "Jane Smith"
      }
    },
    unread_count: 0,
    is_pinned: false,
    is_muted: true,
    have_blocked: false,
    been_blocked: false
  },
  {
    id: "3",
    name: "Project Team",
    type: "group",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Team",
    last_message: {
      id: "m3",
      message: "Meeting at 2 PM",
      created_at: "2024-03-20T09:15:00Z",
      sender: {
        id: "1",
        name: "John Doe"
      }
    },
    unread_count: 5,
    is_pinned: true,
    is_muted: false,
    have_left: false,
    is_kicked: false
  },
  {
    id: "4",
    name: "Family Group",
    type: "group",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Family",
    last_message: {
      id: "m4",
      message: "Mom: Dinner at 7",
      created_at: "2024-03-20T08:00:00Z",
      sender: {
        id: "5",
        name: "Mom"
      }
    },
    unread_count: 0,
    is_pinned: false,
    is_muted: false,
    have_left: false,
    is_kicked: false
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API functions
export const fetchChats = async (): Promise<Chat[]> => {
  await delay(1000); // Simulate network delay
  return sampleChats;
};

export const fetchChatById = async (id: string): Promise<Chat | undefined> => {
  await delay(500);
  return sampleChats.find(chat => chat.id === id);
};

export const fetchPinnedChats = async (): Promise<Chat[]> => {
  await delay(800);
  return sampleChats.filter(chat => chat.is_pinned);
};

export const fetchUnreadChats = async (): Promise<Chat[]> => {
  await delay(800);
  return sampleChats.filter(chat => chat.unread_count > 0);
}; 