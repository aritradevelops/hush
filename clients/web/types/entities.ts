import { UUID } from "crypto";
type timestamp = string;


export type PrimaryColumns = {
  id: UUID;
  created_at: timestamp;
  updated_at: timestamp | null;
  deleted_at: timestamp | null;
  created_by: UUID;
  updated_by: UUID | null;
  deleted_by: UUID | null;
}

// Chat
export type Chat = PrimaryColumns & {
  encrypted_message: string;
  iv: string;
  channel_id: UUID;
}

// Contact
export type Contact = PrimaryColumns & {
  nickname: string;
  user_id: UUID;
  channel_id: UUID;
}

// Group Member
export type GroupMember = PrimaryColumns & {
  channel_id: UUID;
  user_id: UUID;
  has_pinned: boolean;
  has_muted: boolean;
}

// User
export type User = PrimaryColumns & {
  name: string;
  email: string;
  dp?: string;
}

// Direct Message
export type DirectMessage = PrimaryColumns & {
  member_ids: [UUID, UUID];
  last_chat: Chat | null;
}
export type DirectMessageWithLastChat = DirectMessage & {
  last_chat: Chat | null;
  contact: Contact | null;
  chat_user: User;
}

// Group
export type Group = PrimaryColumns & {
  name: string;
  description?: string;
  image?: string;
  members: UUID[];
}
export type GroupWithLastChat = Group & {
  last_chat: Chat | null;
}

export type PublicKey = PrimaryColumns & {
  user_id: UUID
  key: string
}

export type SharedSecret = PrimaryColumns & {
  encrypted_shared_secret: string
  channel_id: UUID
  user_id: UUID
}

// Channel
export enum ChannelType {
  DIRECT_MESSAGE = 'dm',
  GROUP = 'group',
}

export type Channel = PrimaryColumns & {
  type: '0' | '1'
  metadata?: {
    name: string
    description: string
    image?: string
  }
}



export type ChannelOverview = {
  id: UUID;
  type: ChannelType;
  name: string;
  image: string | null;
  has_muted: boolean;
  has_pinned: boolean;
  has_blocked: boolean;
  has_left: boolean;
  permissible_last_message_timestamp: Date | null;
  last_chat: Chat & { sender_name: string, sender_image?: string } | null;
  unread_count: number;
}

export type DmDetails = Channel & {
  chat_user: User;
  contact: Contact | null;
  has_blocked: boolean;
}

export type GroupDetails = Channel & {
  group_members: (GroupMember & { user: User; contact: Contact | null; is_blocked: boolean })[];
  has_left: boolean;
}

export enum UserChatInteractionStatus {
  // -1 is not part of the server status but it is kept for the client to show that the message is being sent
  SENDING = -1,
  SENT,
  DELIVERED,
  SEEN,
}
export type UserChatInteraction = PrimaryColumns & {
  chat_id: UUID;
  channel_id: UUID;
  status: UserChatInteractionStatus;
}

export enum ChatMediaStatus {
  PENDING = 0,
  INITIALIZED = 1,
  UPLOADED
}

export type ChatMedia = PrimaryColumns & {
  name: string;
  chat_id: UUID;
  channel_id: UUID;
  iv: string;
  file_size: number;
  cloud_storage_url: string;
  mime_type: string;
  status: ChatMediaStatus
}