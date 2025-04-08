
import Password from "../entities/password";
import { Repository } from "../lib/repository";

export class PasswordRepository extends Repository<typeof Password> {
  constructor() {
    super(Password);
  }
};
export default new PasswordRepository();
  