
import { UUID } from "crypto";
import UserChatInteraction from "../entities/user-chat-interaction";
import { Repository } from "../lib/repository";
import userChatInteractionQuery from "../queries/user-chat-interaction.query";
import Chat from "../entities/chat";

export class UserChatInteractionRepository extends Repository<typeof UserChatInteraction> {
  constructor() {
    super(UserChatInteraction);
  }
  async getPendingInteractions(userId: UUID) {
    const query = userChatInteractionQuery.findNotInteractedChats();
    const result = await this.entity.query(query, [userId]);
    return result as (Pick<UserChatInteraction, 'id' | 'channel_id'> & { chat: Chat })[];
  }
  async getNotSeenInteractions(userId: UUID, channelId: UUID) {
    const query = userChatInteractionQuery.findNotSeenChats();
    const result = await this.entity.query(query, [userId, channelId]);
    return result as (Pick<UserChatInteraction, 'id' | 'channel_id'> & { chat: Chat })[];
  }
};
export default new UserChatInteractionRepository();
