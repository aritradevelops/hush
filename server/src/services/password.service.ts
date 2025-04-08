
import { UUID } from "crypto";
import passwordRepository, { PasswordRepository } from "../repositories/password.repository";
import CrudService from "../utils/crud-service";
import { IsNull } from "typeorm";
import { Request, Response } from "express";
export class PasswordService extends CrudService<PasswordRepository> {
  constructor() {
    super(passwordRepository);
  }
  async getByUserId(req: Request, res: Response, userId: UUID) {
    return await this.repository.view({ user_id: userId, deleted_at: IsNull() })
  }
}
export default new PasswordService();
