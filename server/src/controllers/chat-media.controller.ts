
import ChatMedia from "../entities/chat-media";
import chatMediaService, { ChatMediaService } from "../services/chat-media.service";
import CrudController from "../utils/crud-controller";
export class ChatMediaController extends CrudController<typeof ChatMedia, ChatMediaService> {
  constructor() {
    super(chatMediaService, ChatMedia);
  }
};
export default new ChatMediaController();
  