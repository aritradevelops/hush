
import { Request, Response } from "express";
import { PrimaryColumns } from "../lib/primary-columns";
import chatRepository, { ChatRepository } from "../repositories/chat.repository";
import { ListParams } from "../schemas/list-params";
import CrudService from "../utils/crud-service";
import { Not } from "typeorm";

export class ChatService extends CrudService<ChatRepository> {
  constructor() {
    super(chatRepository);
  }
  async list(req: Request, res: Response, listParams: ListParams): Promise<[PrimaryColumns[], number]> {
    const result = await super.list(req, res, listParams)
    // @ts-ignore
    const roomId = req.query['where_clause']['channel_id'];
    await this.repository.update({ channel_id: roomId, created_by: Not(req.user!.id) }, { unread: false })
    return result;
  }
}
export default new ChatService();
