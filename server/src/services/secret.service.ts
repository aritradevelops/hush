
import secretRepository, { SecretRepository } from "../repositories/secret.repository";
import CrudService from "../utils/crud-service";
import { Request, Response } from "express";
export class SecretService extends CrudService<SecretRepository> {
  constructor() {
    super(secretRepository);
  }
  async forChannel(req: Request, res: Response) {
    return await this.repository.view({ channel_id: req.body.channel_id, user_id: req.user!.id })
  }
}
export default new SecretService();
