
import { UUID } from "crypto";
import Group from "../entities/group";
import { Repository } from "../lib/repository";
import groupQuery from "../queries/group.query";
import Chat from "../entities/chat";

export class GroupRepository extends Repository<typeof Group> {
  constructor() {
    super(Group);
  }
  async listWithLastChat(userId: UUID) {
    const query = groupQuery.listWithLastChat();
    const result = await this.entity.query(query, [userId]) as (Group & { last_chat: Chat | null })[];
    return [result, result.length];
  }
};
export default new GroupRepository();
