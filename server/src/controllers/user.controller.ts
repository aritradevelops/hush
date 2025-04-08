
import { Request, Response } from "express";
import { GET } from "../decorators/method";
import User from "../entities/user";
import userService, { UserService } from "../services/user.service";
import CrudController from "../utils/crud-controller";
import { kebabToPascal } from "../utils/string";

export class UserController extends CrudController<typeof User, UserService> {
  constructor() {
    super(userService, User);
  }

  @GET()
  async me(req: Request, res: Response) {
    const user = await this.service.me(req, res);
    return {
      message: req.t('user.me'),
      data: user
    };
  }
  @GET()
  async unknowns(req: Request, res: Response) {
    const [data, total] = await this.service.listExcludingContacts(req, res);
    return {
      message: req.t('controller.list', { module: kebabToPascal(req.params.module as string) }),
      data,
      info: {
        total,
      }
    };
  }
};
export default new UserController();
