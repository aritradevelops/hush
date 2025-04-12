
import { UUID } from "crypto";
import Chat from "../entities/chat";
import { Repository } from "../lib/repository";
import chatsQuery from "../queries/chats.query";
import { ListParams } from "../schemas/list-params";

export class ChatRepository extends Repository<typeof Chat> {
  constructor() {
    super(Chat);
  }
  async getChatsForDm(listParams: ListParams, userId: UUID, channelId: UUID) {
    const query = chatsQuery.getMessagesForDm();
    const result = await this.entity.query(query, [userId, channelId, (listParams.page - 1) * listParams.per_page, listParams.per_page]);
    return [result, result[0]?.total_count || 0] as [Chat[], number];
  }
  async getChatsForGroup(listParams: ListParams, userId: UUID, channelId: UUID) {
    const query = chatsQuery.getMessagesForGroup();
    const result = await this.entity.query(query, [userId, channelId, (listParams.page - 1) * listParams.per_page, listParams.per_page]);
    return [result, result[0]?.total_count || 0] as [Chat[], number];
  }
};
export default new ChatRepository();
