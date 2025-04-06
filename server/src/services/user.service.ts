
import { UUID } from "crypto";
import { BadRequestError } from "../errors/http/bad-request.error";
import userRepository, { UserRepository } from "../repositories/user.repository";
import CrudService from "../utils/crud-service";
import { Request, Response } from "express";
export class UserService extends CrudService<UserRepository> {
  constructor() {
    super(userRepository);
  }
  async publicKey(id: UUID) {
    const result = await this.repository.view({ id: id })
    if (!result) throw new BadRequestError()
    return result.public_key;
  }
  async addPublicKey(id: UUID, publicKey: string) {
    const result = await this.repository.update({ id: id }, { public_key: publicKey })
    if (!result.affected) throw new BadRequestError()
    return result.affected;
  }
  async listNewUsers(req: Request, res: Response) {
    const { search } = req.query
    if (!search || typeof search !== 'string') throw new BadRequestError()
    const result = await this.repository.listNewUsers(req.user!.id, search)
    return result;
  }
}
export default new UserService();
