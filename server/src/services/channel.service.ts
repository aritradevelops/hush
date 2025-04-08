
import channelRepository, { ChannelRepository } from "../repositories/channel.repository";
import CrudService from "../utils/crud-service";
import { Request, Response } from "express";

export class ChannelService extends CrudService<ChannelRepository> {
  constructor() {
    super(channelRepository);
  }
  async overview(req: Request, res: Response) {
    const userId = req.user!.id;
    return await this.repository.overview(userId);
  }
}
export default new ChannelService();
