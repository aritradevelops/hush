
import { UUID } from "crypto";
import Group from "../entities/group";
import { Repository } from "../lib/repository";
import groupQuery from "../queries/group.query";
import Chat from "../entities/chat";
import GroupMember from "../entities/group-member";
import Contact from "../entities/contact";

export class GroupRepository extends Repository<typeof Group> {
  constructor() {
    super(Group);
  }
  async listWithLastChat(userId: UUID) {
    const query = groupQuery.listWithLastChat();
    const result = await this.entity.query(query, [userId]) as (Group & { last_chat: Chat | null })[];
    return [result, result.length];
  }
  async getDetailsById(userId: UUID, id: UUID) {
    const query = groupQuery.detailsById();
    const result = await this.entity.query(query, [id, userId]);
    return result[0] as Group & { members: GroupMember & { contact: Contact | null }[] };
  }
};
export default new GroupRepository();
