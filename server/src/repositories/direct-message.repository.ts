
import { UUID } from "crypto";
import Chat from "../entities/chat";
import Contact from "../entities/contact";
import DirectMessage from "../entities/direct-message";
import User from "../entities/user";
import { Repository } from "../lib/repository";
import directMessageQuery from "../queries/direct-message.query";

export class DirectMessageRepository extends Repository<typeof DirectMessage> {
  constructor() {
    super(DirectMessage);
  }
  async listWithLastChat(userId: UUID) {
    const query = directMessageQuery.listWithLastChat();
    const result = await this.entity.query(query, [userId]) as (DirectMessage & { last_chat: Chat | null } & { contact: Contact | null } & { chat_user: User })[];
    return [result, result.length];
  }
  async findByMemberIds(userId: UUID, anotherUserId: UUID) {
    const query = directMessageQuery.findByMemberIds();
    const result = await this.entity.query(query, [userId, anotherUserId]);
    return result[0] as DirectMessage;
  }
  async getDetailsById(userId: UUID, id: UUID) {
    const query = directMessageQuery.detailsById();
    const result = await this.entity.query(query, [userId, id]);
    return result[0] as DirectMessage & { contact: Contact | null } & { chat_user: User };
  }
};
export default new DirectMessageRepository();
