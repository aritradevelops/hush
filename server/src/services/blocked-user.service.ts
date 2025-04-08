
import blockedUserRepository, { BlockedUserRepository } from "../repositories/blocked-user.repository";
import CrudService from "../utils/crud-service";

export class BlockedUserService extends CrudService<BlockedUserRepository> {
  constructor() {
    super(blockedUserRepository);
  }
}
export default new BlockedUserService();
  