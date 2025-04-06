
import chatStatusRepository, { ChatStatusRepository } from "../repositories/chat-status.repository";
import CrudService from "../utils/crud-service";

export class ChatStatusService extends CrudService<ChatStatusRepository> {
  constructor() {
    super(chatStatusRepository);
  }
}
export default new ChatStatusService();
  