
import Channel from "../entities/channel";
import channelService, { ChannelService } from "../services/channel.service";
import CrudController from "../utils/crud-controller";
export class ChannelController extends CrudController<typeof Channel, ChannelService> {
  constructor() {
    super(channelService, Channel);
  }
};
export default new ChannelController();
  