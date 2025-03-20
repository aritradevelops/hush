
import { In, Not } from "typeorm";
import Chat from "../entities/chat";
import { Repository } from "../lib/repository";

export class ChatRepository extends Repository<typeof Chat> {
  constructor() {
    super(Chat);
  }
  getUnreadCounts(channel_ids: string[], myId: string) {
    return this.entity.createQueryBuilder(this.entity.name)
      .select(['channel_id', 'created_by', 'COUNT(*) as unread_count']) // Include created_by
      .where({ channel_id: In(channel_ids), unread: true, created_by: Not(myId) })
      .groupBy('channel_id, created_by') // Group by both room_id and created_by
      .execute() as Promise<{ channel_id: string; created_by: string; unread_count: string }[]>;
  }
};
export default new ChatRepository();
