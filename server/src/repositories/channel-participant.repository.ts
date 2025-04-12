
import ChannelParticipant from "../entities/channel-participant";
import { Repository } from "../lib/repository";

export class ChannelParticipantRepository extends Repository<typeof ChannelParticipant> {
  constructor() {
    super(ChannelParticipant);
  }
};
export default new ChannelParticipantRepository();
  