
import { UUID } from "crypto";
import Channel from "../entities/channel";
import { Repository } from "../lib/repository";
import channelQuery from "../queries/channel.query";
import Chat from "../entities/chat";

export interface ChannelOverview {
  id: UUID;
  type: 'group' | 'dm';
  name: string;
  image: string | null;
  has_muted: boolean;
  has_pinned: boolean;
  has_blocked: boolean;
  has_left: boolean;
  permissible_last_message_timestamp: Date | null;
  last_chat: Chat & { sender_name: string; sender_dp?: string } | null;
  unread_count: number;
}

export class ChannelRepository extends Repository<typeof Channel> {
  constructor() {
    super(Channel);
  }

  async overview(userId: UUID) {
    const query = channelQuery.withLastChatAndUnreadCount();
    const result = await this.entity.query(query, [userId]);
    return [result, result.length] as [ChannelOverview[], number];
  }
  async getDmByMemberIds(userId: UUID, contactId: UUID) {
    const query = channelQuery.getDmByMemberIds();
    const result = await this.entity.query(query, [userId, contactId]);
    return result[0];
  }
};
export default new ChannelRepository();
