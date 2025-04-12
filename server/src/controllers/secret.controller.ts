
import { singularize } from "inflection";
import { GET } from "../decorators/method";
import Secret from "../entities/secret";
import { BadRequestError } from "../errors/http/bad-request.error";
import { NotFoundError } from "../errors/http/not-found.error";
import secretService, { SecretService } from "../services/secret.service";
import CrudController from "../utils/crud-controller";
import { Request, Response } from "express";
import { kebabToPascal } from "../utils/string";
import { UUID } from "crypto";
export class SecretController extends CrudController<typeof Secret, SecretService> {
  constructor() {
    super(secretService, Secret);
  }
  @GET()
  async channel(req: Request, res: Response) {
    const channelId = req.params.id;
    if (!channelId) throw new BadRequestError()
    const result = await this.service.forChannel(req, res, channelId as UUID)
    if (!result) throw new NotFoundError()
    return {
      message: req.t('controller.view', { module: singularize(kebabToPascal(req.params.module as string)) }),
      data: result
    }
  }
};
export default new SecretController();
