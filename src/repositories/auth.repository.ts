
import User from "../entities/user";
import { Repository } from "../lib/repository";

export class AuthRepository extends Repository<typeof User> {
  constructor() {
    super(User);
  }
};
export default new AuthRepository();
