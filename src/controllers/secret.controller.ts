
import { GET } from "../decorators/method";
import Secret from "../entities/secret";
import { BadRequestError } from "../errors/http/bad-request.error";
import { NotFoundError } from "../errors/http/not-found.error";
import secretService, { SecretService } from "../services/secret.service";
import CrudController from "../utils/crud-controller";
import { Request, Response } from "express";
export class SecretController extends CrudController<typeof Secret, SecretService> {
  constructor() {
    super(secretService, Secret);
  }
  @GET()
  async room(req: Request, res: Response) {
    const userId = req.user!.id
    const roomId = req.params.id;
    if (!roomId) throw new BadRequestError()
    const result = await this.service.byRoomIdAndUser(roomId, userId)
    if (!result) throw new NotFoundError()
    return result
  }
};
export default new SecretController();
