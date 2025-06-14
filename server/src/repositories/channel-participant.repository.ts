
import { UUID } from "node:crypto";
import ChannelParticipant from "../entities/channel-participant";
import { Repository } from "../lib/repository";
import { IsNull } from "typeorm";

export class ChannelParticipantRepository extends Repository<typeof ChannelParticipant> {
  constructor() {
    super(ChannelParticipant);
  }

  async getByChannelId(channelId: UUID) {
    return await this.entity.find({
      where: { channel_id: channelId, deleted_at: IsNull() },
      select: { user_id: true }
    })
  }
};
export default new ChannelParticipantRepository();
