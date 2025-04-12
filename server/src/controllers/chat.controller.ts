
import { UUID } from "crypto";
import { GET } from "../decorators/method";
import Chat from "../entities/chat";
import chatService, { ChatService } from "../services/chat.service";
import CrudController from "../utils/crud-controller";
import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { ListParams } from "../schemas/list-params";
import { sanitizeAsync } from "class-sanitizer";
export class ChatController extends CrudController<typeof Chat, ChatService> {
  constructor() {
    super(chatService, Chat);
  }
  @GET()
  async dms(req: Request, res: Response) {
    const queryInstance = plainToInstance(ListParams, req.query);
    const sanitizedQuery = await sanitizeAsync(queryInstance);
    // @ts-ignore
    const channelId = queryInstance.where_clause.channel_id.$eq
    const [chats, total] = await this.service.getChatsForDm(req, res, sanitizedQuery, channelId);
    return {
      message: req.t('controller.list', { module: 'chats' }),
      data: chats,
      info: {
        total,
        page: sanitizedQuery.page,
        per_page: sanitizedQuery.per_page,
        trash: sanitizedQuery.trash,
        order_by: sanitizedQuery.order_by,
        order: sanitizedQuery.order,
        search: sanitizedQuery.search,
        where_clause: sanitizedQuery.where_clause,
        select: sanitizedQuery.select,
      }
    }
  }
  @GET()
  async groups(req: Request, res: Response) {
    const queryInstance = plainToInstance(ListParams, req.query);
    const sanitizedQuery = await sanitizeAsync(queryInstance);
    // @ts-ignore
    const channelId = queryInstance.where_clause.channel_id.$eq
    const [chats, total] = await this.service.getChatsForGroup(req, res, sanitizedQuery, channelId);
    return {
      message: req.t('controller.list', { module: 'chats' }),
      data: chats,
      info: {
        total,
        page: sanitizedQuery.page,
        per_page: sanitizedQuery.per_page,
        trash: sanitizedQuery.trash,
        order_by: sanitizedQuery.order_by,
        order: sanitizedQuery.order,
        search: sanitizedQuery.search,
        where_clause: sanitizedQuery.where_clause,
        select: sanitizedQuery.select,
      }
    }
  }
};
export default new ChatController();
