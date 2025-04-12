
import GroupMember from "../entities/group-member";
import { Repository } from "../lib/repository";

export class GroupMemberRepository extends Repository<typeof GroupMember> {
  constructor() {
    super(GroupMember);
  }
};
export default new GroupMemberRepository();
  