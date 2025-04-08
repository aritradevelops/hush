
import { GET } from "../decorators/method";
import Channel from "../entities/channel";
import channelService, { ChannelService } from "../services/channel.service";
import CrudController from "../utils/crud-controller";
import { Request, Response } from "express";
import { kebabToPascal } from "../utils/string";
import { singularize } from "inflection";

export class ChannelController extends CrudController<typeof Channel, ChannelService> {
  constructor() {
    super(channelService, Channel);
  }
  @GET()
  async overview(req: Request, res: Response) {
    const [channels, count] = await this.service.overview(req, res);
    return {
      message: req.t('controller.overview', { module: singularize(kebabToPascal(req.params.module as string)) }),
      data: channels,
      info: {
        total: count
      }
    }
  }
};
export default new ChannelController();
