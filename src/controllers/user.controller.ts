
import { PUT } from "../decorators/method";
import User from "../entities/user";
import userService, { UserService } from "../services/user.service";
import CrudController from "../utils/crud-controller";
import { Request } from "express";
export class UserController extends CrudController<typeof User, UserService> {
  constructor() {
    super(userService, User);
  }
  @PUT()
  async addContact(req: Request) {
    const result = await this.service.addContact(req.user!.id, req.body.contact);
    this.service.addContact(req.body.contact, req.user!.id);
    return result;
  }
};
export default new UserController();
