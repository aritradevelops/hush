
import { Request, Response } from "express";
import { GET ,POST} from "../decorators/method";
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

  // The route for this method is defined by the generic router in app.ts (e.g., POST /v1/user/upload-profile-picture)
  // The @POST decorator only specifies the HTTP method and does not support path arguments.
  @POST()

  async uploadProfilePicture(req: Request, res: Response) {
    const user = await this.service.uploadProfilePicture(req, res);
    return {
      message: req.t('user.profile_picture_uploaded'),
      data: user
    };
  }
};
export default new UserController();
