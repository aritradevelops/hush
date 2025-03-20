export interface PrivateChat {
  id: string;
  name: string;
  type: "private";
  avatar: string;
  last_message: {
    id: string;
    message: string;
    created_at: string;
    sender: {
      id: string;
      name: string;
    }
  }
  unread_count: number;
  is_pinned: boolean;
  is_muted: boolean;
  have_blocked: boolean;
  been_blocked: boolean;
}

export interface GroupChat {
  id: string;
  name: string;
  type: "group";
  avatar: string;
  last_message: {
    id: string;
    message: string;
    created_at: string;
    sender: {
      id: string;
      name: string;
    }
  }
  unread_count: number;
  is_pinned: boolean;
  is_muted: boolean;
  have_left: boolean;
  is_kicked: boolean;
}

export type Chat = PrivateChat | GroupChat; 