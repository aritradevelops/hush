
import channelParticipantRepository, { ChannelParticipantRepository } from "../repositories/channel-participant.repository";
import CrudService from "../utils/crud-service";

export class ChannelParticipantService extends CrudService<ChannelParticipantRepository> {
  constructor() {
    super(channelParticipantRepository);
  }
}
export default new ChannelParticipantService();
  