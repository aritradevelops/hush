
import userChatInteractionRepository, { UserChatInteractionRepository } from "../repositories/user-chat-interaction.repository";
import CrudService from "../utils/crud-service";

export class UserChatInteractionService extends CrudService<UserChatInteractionRepository> {
  constructor() {
    super(userChatInteractionRepository);
  }
}
export default new UserChatInteractionService();
  