
import ChatStatus from "../entities/chat-status";
import chatStatusService, { ChatStatusService } from "../services/chat-status.service";
import CrudController from "../utils/crud-controller";
export class ChatStatusController extends CrudController<typeof ChatStatus, ChatStatusService> {
  constructor() {
    super(chatStatusService, ChatStatus);
  }
};
export default new ChatStatusController();
  