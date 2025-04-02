
import { Request, Response } from "express";
import Group from "../entities/group";
import groupService, { GroupService } from "../services/group.service";
import { GET } from "../decorators/method";
import { kebabToPascal } from "../utils/string";
import CrudController from "../utils/crud-controller";
export class GroupController extends CrudController<typeof Group, GroupService> {
  constructor() {
    super(groupService, Group);
  }

  @GET()
  async listWithLastChat(req: Request, res: Response) {
    const [data, total] = await this.service.listWithLastChat(req, res);
    return {
      message: req.t('controller.list', { module: kebabToPascal(req.params.module as string) }),
      data,
      info: { total }
    };
  }

};
export default new GroupController();
