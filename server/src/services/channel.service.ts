
import { UUID } from "node:crypto";
import channelRepository, { ChannelRepository } from "../repositories/channel.repository";
import CrudService from "../utils/crud-service";
import { Request, Response } from "express";
import { BadRequestError } from "../errors/http/bad-request.error";
export class ChannelService extends CrudService<ChannelRepository> {
  constructor() {
    super(channelRepository);
  }
  async privateChannels(req: Request, res: Response) {
    if (req.query.search && typeof req.query.search !== 'string') throw new BadRequestError()
    return await this.repository.privateChannels(req.user?.id!, req.query.search || '')
  }
  async groupChannels(req: Request, res: Response) {
    if (req.query.search && typeof req.query.search !== 'string') throw new BadRequestError()
    return await this.repository.groupChannels(req.user?.id!, req.query.search || '')
  }
}
export default new ChannelService();
