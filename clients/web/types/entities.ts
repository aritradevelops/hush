import { UUID } from "crypto";
type timestamp = string;
// Common For all entities
export enum Status {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LOCKED = 'LOCKED',
  DEACTIVATED = 'DEACTIVATED'
}

export interface PrimaryColumns {
  id: UUID;
  status: Status;
  created_at: timestamp;
  updated_at: timestamp | null;
  deleted_at: timestamp | null;
  created_by: UUID;
  updated_by: UUID | null;
  deleted_by: UUID | null;
}

// Chat
export interface Chat extends PrimaryColumns {
  message: string;
  iv: string;
  channel_id: UUID;
  unread: boolean;
}

// Contact
export interface Contact extends PrimaryColumns {
  name: string;
  user_id: UUID;
  channel_id: UUID;
  is_pinned: boolean;
  is_muted: boolean;
  is_blocked: boolean;
}

// Group Member
export interface GroupMember extends PrimaryColumns {
  channel_id: UUID;
  user_id: UUID;
  has_pinned: boolean;
  has_muted: boolean;
}

// User
export interface User extends PrimaryColumns {
  name: string;
  email: string;
  avatar?: string;
  password?: string | null;
  email_verification_hash: timestamp | null;
  reset_password_hash: timestamp | null;
  reset_password_hash_expiry: timestamp | null;
  contacts: string[];
  public_key: string | null;
}


// Direct Message
export interface DirectMessage extends PrimaryColumns {
  member_ids: [UUID, UUID];
  last_chat: Chat | null;
}
export type DirectMessageWithLastChat = DirectMessage & { last_chat: Chat | null } & { contact: Contact | null } & { chat_user: User }

// Group
export interface Group extends PrimaryColumns {
  name: string;
  description?: string;
  image?: string;
  members: UUID[];
}
export type GroupWithLastChat = Group & { last_chat: Chat | null }
// Channel
export enum ChannelType {
  DIRECT_MESSAGE = 'direct-message',
  GROUP = 'group',
}


export type Channel = DirectMessageWithLastChat & { type: ChannelType.DIRECT_MESSAGE } | GroupWithLastChat & { type: ChannelType.GROUP }
export type ChannelWithLastChat = Channel & { last_chat: Chat | null }