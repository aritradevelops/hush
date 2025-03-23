
import GroupMember from "../entities/group-member";
import groupMemberService, { GroupMemberService } from "../services/group-member.service";
import CrudController from "../utils/crud-controller";
export class GroupMemberController extends CrudController<typeof GroupMember, GroupMemberService> {
  constructor() {
    super(groupMemberService, GroupMember);
  }
};
export default new GroupMemberController();
  