
import { Request, Response } from "express";
import DirectMessage from "../entities/direct-message";
import { PrimaryColumns } from "../lib/primary-columns";
import directMessageService, { DirectMessageService } from "../services/direct-message.service";
import { ClauseMap } from "../utils/clauses";
import CrudController from "../utils/crud-controller";
import { GET } from "../decorators/method";
import { kebabToPascal } from "../utils/string";
import { NotFoundError } from "../errors/http/not-found.error";
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
    const result = await this.service.getDetailsById(req, res);
    if (!result) throw new NotFoundError()
    return {
      message: req.t('controller.get', { module: kebabToPascal(req.params.module as string) }),
      data: result
    };
  }
};
export default new DirectMessageController();
