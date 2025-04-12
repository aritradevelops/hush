
import { GET } from "../decorators/method";
import Channel from "../entities/channel";
import channelService, { ChannelService } from "../services/channel.service";
import CrudController from "../utils/crud-controller";
import { Request, Response } from "express";
import { kebabToPascal } from "../utils/string";
import { singularize } from "inflection";
import { UUID } from "crypto";
import { isUUID } from "class-validator-custom-errors";
import { BadRequestError } from "../errors/http/bad-request.error";
import { NotFoundError } from "../errors/http/not-found.error";

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
  @GET()
  async dms(req: Request, res: Response) {
    const id = req.params.id as UUID;
    if (!id || !isUUID(id, '4')) throw new BadRequestError();
    const dm = await this.service.getDmDetails(req, res, id);
    if (!dm) throw new NotFoundError();
    return {
      message: req.t('dm_details', { module: singularize(kebabToPascal(req.params.module as string)) }),
      data: dm,
    }
  }

  @GET()
  async groups(req: Request, res: Response) {
    const id = req.params.id as UUID;
    if (!id || !isUUID(id, '4')) throw new BadRequestError();
    const group = await this.service.getGroupDetails(req, res, id);
    if (!group) throw new NotFoundError();
    return {
      message: req.t('group_details', { module: singularize(kebabToPascal(req.params.module as string)) }),
      data: group,
    }
  }
};
export default new ChannelController();
