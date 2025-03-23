
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
  async privateChannels(req: Request, res: Response) {
    const result = await this.service.privateChannels(req, res)
    return {
      message: req.t('private_channels'),
      data: result
    }
  }
  @GET()
  async groupChannels(req: Request, res: Response) {
    const result = await this.service.groupChannels(req, res)
    return {
      message: req.t('group_channels'),
      data: result
    }
  }
}
export default new ChannelController();
