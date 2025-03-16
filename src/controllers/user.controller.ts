
import { UUID } from "crypto";
import { GET, PUT } from "../decorators/method";
import User from "../entities/user";
import { BadRequestError } from "../errors/http/bad-request.error";
import { NotFoundError } from "../errors/http/not-found.error";
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
  @GET()
  async publicKey(req: Request) {
    if (!req.params.id) throw new BadRequestError()
    const result = await this.service.publicKey(req.params.id as UUID)
    if (!result) throw new NotFoundError()
    return { public_key: result };
  }
  @PUT()
  async addPublicKey(req: Request) {
    const key = req.body.public_key
    if (!key || !key.length) throw new BadRequestError()
    await this.service.addPublicKey(req.user!.id, key)
    return null;
  }
};
export default new UserController();
