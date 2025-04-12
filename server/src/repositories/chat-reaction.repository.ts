
import ChatReaction from "../entities/chat-reaction";
import { Repository } from "../lib/repository";

export class ChatReactionRepository extends Repository<typeof ChatReaction> {
  constructor() {
    super(ChatReaction);
  }
};
export default new ChatReactionRepository();
  