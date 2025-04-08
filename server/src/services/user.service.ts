
import { UUID } from "crypto";
import { BadRequestError } from "../errors/http/bad-request.error";
import userRepository, { UserRepository } from "../repositories/user.repository";
import CrudService from "../utils/crud-service";
import { Request, Response } from "express";
import { IsNull } from "typeorm";
import contactService from "./contact.service";
import { ListParams } from "../schemas/list-params";
import { plainToInstance } from "class-transformer";
export class UserService extends CrudService<UserRepository> {
  constructor() {
    super(userRepository);
  }
  async listExcludingContacts(req: Request, res: Response) {
    const { search } = req.query
    if (!search || typeof search !== 'string') throw new BadRequestError()
    const result = await this.repository.listExcludingContacts(req.user!.id, search)
    return result;
  }
  async me(req: Request, res: Response) {
    const scopedFilter = this.getScopedFilter(req)
    const userId = req.user!.id
    const user = await this.repository.view({ id: userId, ...scopedFilter, deleted_at: IsNull() })
    if (!user) throw new BadRequestError()
    return user;
  }
}
export default new UserService();
