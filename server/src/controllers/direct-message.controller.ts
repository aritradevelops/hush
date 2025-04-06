
import { UUID } from "crypto";
import { Request, Response } from "express";
import { GET } from "../decorators/method";
import DirectMessage from "../entities/direct-message";
import { NotFoundError } from "../errors/http/not-found.error";
import directMessageService, { DirectMessageService } from "../services/direct-message.service";
import CrudController from "../utils/crud-controller";
import { kebabToPascal } from "../utils/string";
export class DirectMessageController extends CrudController<typeof DirectMessage, DirectMessageService> {
  constructor() {
    super(directMessageService, DirectMessage);
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
    if (!result) throw new NotFoundError()
    return {
      message: req.t('controller.get', { module: kebabToPascal(req.params.module as string) }),
      data: result
    };
  }
};
export default new DirectMessageController();
