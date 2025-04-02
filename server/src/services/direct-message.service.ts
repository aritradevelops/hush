
import { UUID } from "crypto";
import directMessageRepository, { DirectMessageRepository } from "../repositories/direct-message.repository";
import CrudService from "../utils/crud-service";
import { Request, Response } from "express";
export class DirectMessageService extends CrudService<DirectMessageRepository> {
  constructor() {
    super(directMessageRepository);
  }
  async listWithLastChat(req: Request, res: Response) {
    const userId = req.user!.id;
    const result = await this.repository.listWithLastChat(userId);
    return result;
  }
  async getDetailsById(req: Request, res: Response) {
    const userId = req.user!.id;
    const id = req.params.id as UUID;
    const result = await this.repository.getDetailsById(userId, id);
    return result;
  }
}
export default new DirectMessageService();
