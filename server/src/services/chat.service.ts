
import { Request, Response } from "express";
import { UUID } from "node:crypto";
import { PrimaryColumns } from "../lib/primary-columns";
import chatRepository, { ChatRepository } from "../repositories/chat.repository";
import CrudService from "../utils/crud-service";
import Chat from "../entities/chat";
import { ListParams } from "../schemas/list-params";


export class ChatService extends CrudService<ChatRepository> {
  constructor() {
    super(chatRepository);
  }
  async getChatsForDm(req: Request, res: Response, query: ListParams, channelId: UUID): Promise<[Chat[], number]> {
    const result = await this.repository.getChatsForDm(query, req.user!.id, channelId);
    return result;
  }
  async getChatsForGroup(req: Request, res: Response, query: ListParams, channelId: UUID): Promise<[Chat[], number]> {
    const result = await this.repository.getChatsForGroup(query, req.user!.id, channelId);
    return result;
  }
}
export default new ChatService();
