
import { Request, Response } from "express";
import { UUID } from "node:crypto";
import { Not } from "typeorm";
import { PrimaryColumns } from "../lib/primary-columns";
import chatRepository, { ChatRepository } from "../repositories/chat.repository";
import { ListParams } from "../schemas/list-params";
import CrudService from "../utils/crud-service";
import { EqualsClause } from "../utils/clauses";


export class ChatService extends CrudService<ChatRepository> {
  constructor() {
    super(chatRepository);
  }
  async list(req: Request, res: Response, listParams: ListParams): Promise<[PrimaryColumns[], number]> {
    const result = await super.list(req, res, listParams)
    // @ts-ignore
    const roomId = (req.query['where_clause']['channel_id'] as EqualsClause).$eq as UUID;
    await this.repository.update({ channel_id: roomId, created_by: Not(req.user!.id) }, { unread: false })
    return result;
  }
}

export default new ChatService();
