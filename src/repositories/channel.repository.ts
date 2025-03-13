
import Channel from "../entities/channel";
import { Repository } from "../lib/repository";

export class ChannelRepository extends Repository<typeof Channel> {
  constructor() {
    super(Channel);
  }
};
export default new ChannelRepository();
  