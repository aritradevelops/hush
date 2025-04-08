
import { Request, Response } from "express";
import { UUID } from "node:crypto";
import { Not } from "typeorm";
import { PrimaryColumns } from "../lib/primary-columns";
import chatRepository, { ChatRepository } from "../repositories/chat.repository";
import { ListParams } from "../schemas/list-params";
import CrudService from "../utils/crud-service";
import { EqualsClause } from "../utils/clauses";
import userChatInteractionRepository from "../repositories/user-chat-interaction.repository";
import { UserChatInteractionStatus } from "../entities/user-chat-interaction";


export class ChatService extends CrudService<ChatRepository> {
  constructor() {
    super(chatRepository);
  }
  async list(req: Request, res: Response, listParams: ListParams): Promise<[PrimaryColumns[], number]> {
    const result = await super.list(req, res, listParams)
    // @ts-ignore
    const channelId = (req.query['where_clause']['channel_id'] as EqualsClause).$eq as UUID;
    await userChatInteractionRepository.update({ channel_id: channelId, status: Not(UserChatInteractionStatus.SEEN) }, { status: UserChatInteractionStatus.SEEN })
    return result;
  }
}

export default new ChatService();
