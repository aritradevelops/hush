
import { GET } from "../decorators/method";
import Channel from "../entities/channel";
import channelService, { ChannelService } from "../services/channel.service";
import CrudController from "../utils/crud-controller";
import { Request, Response } from "express";
export class ChannelController extends CrudController<typeof Channel, ChannelService> {
  constructor() {
    super(channelService, Channel);
  }
  @GET()
  async groupChats(req: Request, res: Response) {
    const result = await this.service.groupChats(req.user?.id!)
    return {
      message: req.t('group_chats'),
      data: result
    }
  }
};
export default new ChannelController();
