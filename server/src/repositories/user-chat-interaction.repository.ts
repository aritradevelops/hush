
import UserChatInteraction from "../entities/user-chat-interaction";
import { Repository } from "../lib/repository";

export class UserChatInteractionRepository extends Repository<typeof UserChatInteraction> {
  constructor() {
    super(UserChatInteraction);
  }
};
export default new UserChatInteractionRepository();
  