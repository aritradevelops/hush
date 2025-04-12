
import ChatReaction from "../entities/chat-reaction";
import chatReactionService, { ChatReactionService } from "../services/chat-reaction.service";
import CrudController from "../utils/crud-controller";
export class ChatReactionController extends CrudController<typeof ChatReaction, ChatReactionService> {
  constructor() {
    super(chatReactionService, ChatReaction);
  }
};
export default new ChatReactionController();
  