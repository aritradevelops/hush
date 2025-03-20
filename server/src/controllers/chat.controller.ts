
import Chat from "../entities/chat";
import chatService, { ChatService } from "../services/chat.service";
import CrudController from "../utils/crud-controller";
export class ChatController extends CrudController<typeof Chat, ChatService> {
  constructor() {
    super(chatService, Chat);
  }
};
export default new ChatController();
  