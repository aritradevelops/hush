
import userRepository, { UserRepository } from "../repositories/user.repository";
import CrudService from "../utils/crud-service";

export class UserService extends CrudService<UserRepository> {
  constructor() {
    super(userRepository);
  }
  addContact(id: string, contact: string) {
    return this.repository.addContact(id, contact)
  }
}
export default new UserService();
