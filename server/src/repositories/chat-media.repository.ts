
import ChatMedia from "../entities/chat-media";
import { Repository } from "../lib/repository";

export class ChatMediaRepository extends Repository<typeof ChatMedia> {
  constructor() {
    super(ChatMedia);
  }
};
export default new ChatMediaRepository();
  