
import { Request, Response } from "express";
import Group from "../entities/group";
import groupService, { GroupService } from "../services/group.service";
import { GET } from "../decorators/method";
import { kebabToPascal } from "../utils/string";
import CrudController from "../utils/crud-controller";
import { UUID } from "crypto";
import { singularize } from "inflection";
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

  @GET()
  async details(req: Request, res: Response) {
    const id = req.params.id as UUID;
    const result = await this.service.getDetailsById(req, res, id);
    return {
      message: req.t('controller.view', { module: singularize(kebabToPascal(req.params.module as string)) }),
      data: result
    };
  }
};
export default new GroupController();
