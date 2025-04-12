
import BlockedUser from "../entities/blocked-user";
import { Repository } from "../lib/repository";

export class BlockedUserRepository extends Repository<typeof BlockedUser> {
  constructor() {
    super(BlockedUser);
  }
};
export default new BlockedUserRepository();
  