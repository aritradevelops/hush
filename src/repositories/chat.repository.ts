
import { In, Not } from "typeorm";
import Chat from "../entities/chat";
import { Repository } from "../lib/repository";
import { PrimaryColumns } from "../lib/primary-columns";
import { ListParams } from "../schemas/list-params";

export class ChatRepository extends Repository<typeof Chat> {
  constructor() {
    super(Chat);
  }
  getUnreadCounts(room_ids: string[], myId: string) {
    return this.entity.createQueryBuilder(this.entity.name)
      .select(['room_id', 'created_by', 'COUNT(*) as unread_count']) // Include created_by
      .where({ room_id: In(room_ids), unread: true, created_by: Not(myId) })
      .groupBy('room_id, created_by') // Group by both room_id and created_by
      .execute() as Promise<{ room_id: string; created_by: string; unread_count: string }[]>;
  }
};
export default new ChatRepository();
