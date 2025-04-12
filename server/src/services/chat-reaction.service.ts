
import chatReactionRepository, { ChatReactionRepository } from "../repositories/chat-reaction.repository";
import CrudService from "../utils/crud-service";

export class ChatReactionService extends CrudService<ChatReactionRepository> {
  constructor() {
    super(chatReactionRepository);
  }
}
export default new ChatReactionService();
  