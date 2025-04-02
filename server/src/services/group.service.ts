
import groupRepository, { GroupRepository } from "../repositories/group.repository";
import CrudService from "../utils/crud-service";
import { Request, Response } from "express";
export class GroupService extends CrudService<GroupRepository> {
  constructor() {
    super(groupRepository);
  }
  async listWithLastChat(req: Request, res: Response) {
    const userId = req.user!.id;
    const result = await this.repository.listWithLastChat(userId);
    return result;
  }
}
export default new GroupService();
