
import channelRepository, { ChannelRepository } from "../repositories/channel.repository";
import CrudService from "../utils/crud-service";

export class ChannelService extends CrudService<ChannelRepository> {
  constructor() {
    super(channelRepository);
  }
  async groupChats(userId: string) {
    return this.repository.groupChats(userId)
  }
}
export default new ChannelService();
