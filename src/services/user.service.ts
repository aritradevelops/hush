
import { BadRequestError } from "../errors/http/bad-request.error";
import userRepository, { UserRepository } from "../repositories/user.repository";
import CrudService from "../utils/crud-service";

export class UserService extends CrudService<UserRepository> {
  constructor() {
    super(userRepository);
  }
  addContact(id: string, contact: string) {
    return this.repository.addContact(id, contact)
  }
  async publicKey(id: string) {
    const result = await this.repository.view({ id: id })
    if (!result) throw new BadRequestError()
    return result.public_key;
  }
  async addPublicKey(id: string, publicKey: string) {
    const result = await this.repository.update({ id: id }, { public_key: publicKey })
    if (!result.affected) throw new BadRequestError()
    return result.affected;
  }
}
export default new UserService();
