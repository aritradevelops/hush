
import chatMediaRepository, { ChatMediaRepository } from "../repositories/chat-media.repository";
import CrudService from "../utils/crud-service";

export class ChatMediaService extends CrudService<ChatMediaRepository> {
  constructor() {
    super(chatMediaRepository);
  }
}
export default new ChatMediaService();
  