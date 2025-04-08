
import { In } from "typeorm";
import User from "../entities/user";
import { Repository } from "../lib/repository";
import userQuery from "../queries/user.query";
import { UUID } from "crypto";

export class UserRepository extends Repository<typeof User> {
  constructor() {
    super(User);
  }

  async listExcludingContacts(userId: UUID, search: string = '') {
    const query = userQuery.findUsersExcludingContacts()
    const result = await this.entity.query(query, [userId, search.trim().split(" ").join(":* & ").concat(":*")])
    return [result, result.length]
  }
};
export default new UserRepository();
