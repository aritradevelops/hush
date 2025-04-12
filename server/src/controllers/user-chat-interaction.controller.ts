
import UserChatInteraction from "../entities/user-chat-interaction";
import userChatInteractionService, { UserChatInteractionService } from "../services/user-chat-interaction.service";
import CrudController from "../utils/crud-controller";
export class UserChatInteractionController extends CrudController<typeof UserChatInteraction, UserChatInteractionService> {
  constructor() {
    super(userChatInteractionService, UserChatInteraction);
  }
};
export default new UserChatInteractionController();
  