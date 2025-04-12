
import ChannelParticipant from "../entities/channel-participant";
import channelParticipantService, { ChannelParticipantService } from "../services/channel-participant.service";
import CrudController from "../utils/crud-controller";
export class ChannelParticipantController extends CrudController<typeof ChannelParticipant, ChannelParticipantService> {
  constructor() {
    super(channelParticipantService, ChannelParticipant);
  }
};
export default new ChannelParticipantController();
  