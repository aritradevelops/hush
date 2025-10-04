
import { UUID } from "crypto";
import { Request, Response } from "express";
import channelRepository, { ChannelRepository } from "../repositories/channel.repository";
import CrudService from "../utils/crud-service";

export class ChannelService extends CrudService<ChannelRepository> {
  constructor() {
    super(channelRepository);
  }
  async overview(req: Request, res: Response) {
    const userId = req.user!.id;
    return await this.repository.overview(userId);
  }
  async getDmDetails(req: Request, res: Response, id: UUID) {
    const userId = req.user!.id;
    return await this.repository.getDmDetails(userId, id);
  }
  async getGroupDetails(req: Request, res: Response, id: UUID) {
    const userId = req.user!.id;
    return await this.repository.getGroupDetails(userId, id);
  }
  async getChannel(req: Request, res: Response, id: UUID) {
    const userId = req.user!.id;
    return await this.repository.getChannelById(userId, id);
  }
}
export default new ChannelService();
