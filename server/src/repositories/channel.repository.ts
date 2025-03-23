
import { UUID } from "node:crypto";
import Channel from "../entities/channel";
import { Repository } from "../lib/repository";
import channelQuery from "../queries/channel.query";

export class ChannelRepository extends Repository<typeof Channel> {
  constructor() {
    super(Channel);
  }

  async privateChannels(user_id: UUID, search: string) {
    const query = channelQuery.getPrivateChannels();
    const privateChats = await this.entity.query(query, [user_id, search])
    return privateChats as PrivateChannel[]
  }

  async groupChannels(user_id: UUID, search: string) {
    const query = channelQuery.getGroupChannels();
    const groupChats = await this.entity.query(query, [user_id, search])
    return groupChats as GroupChannel[]
  }
}

export default new ChannelRepository();


interface PrivateChannel {
  id: UUID;
  name: string;
  picture: string;
  type: 'direct' | 'group';
  avatar?: string;
  user_id: UUID;
  is_pinned: boolean;
  is_muted: boolean;
  search: string;
  is_pending: boolean;
  have_blocked: boolean;
  unread_count: number;
  been_blocked: boolean;
  last_event_time: string;
  last_chat: {
    id: UUID;
    message: string;
    created_at: string;
    sender: string;
  } | null;
}
interface GroupChannel {
  id: UUID;
  name: string;
  picture: string;
  type: 'direct' | 'group';
  avatar?: string;
  user_id: UUID;
  is_pinned: boolean;
  is_muted: boolean;
  joined_at: string;
  left_at: string;
  unread_count: number;
  last_event_time: string;
  last_chat: {
    id: UUID;
    message: string;
    created_at: string;
    sender: string;
  } | null;
}
