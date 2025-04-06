
import ChatStatus from "../entities/chat-status";
import { Repository } from "../lib/repository";

export class ChatStatusRepository extends Repository<typeof ChatStatus> {
  constructor() {
    super(ChatStatus);
  }
};
export default new ChatStatusRepository();
  