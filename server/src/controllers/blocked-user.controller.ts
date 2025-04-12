
import BlockedUser from "../entities/blocked-user";
import blockedUserService, { BlockedUserService } from "../services/blocked-user.service";
import CrudController from "../utils/crud-controller";
export class BlockedUserController extends CrudController<typeof BlockedUser, BlockedUserService> {
  constructor() {
    super(blockedUserService, BlockedUser);
  }
};
export default new BlockedUserController();
  