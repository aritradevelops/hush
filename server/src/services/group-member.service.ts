
import groupMemberRepository, { GroupMemberRepository } from "../repositories/group-member.repository";
import CrudService from "../utils/crud-service";

export class GroupMemberService extends CrudService<GroupMemberRepository> {
  constructor() {
    super(groupMemberRepository);
  }
}
export default new GroupMemberService();
  