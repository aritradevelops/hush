
import { singularize } from "inflection";
import { GET } from "../decorators/method";
import Call from "../entities/call";
import callService, { CallService } from "../services/call.service";
import CrudController from "../utils/crud-controller";
import { Request, Response } from "express";
import { kebabToPascal } from "../utils/string";
export class CallController extends CrudController<typeof Call, CallService> {
  constructor() {
    super(callService, Call);
  }

  @GET()
  async ongoing(req: Request, res: Response) {
    const [calls, count] = await this.service.ongoing(req, res)
    return {
      message: req.t('controller.ongoing', { module: singularize(kebabToPascal(req.params.module as string)) }),
      data: calls,
      info: {
        total: count
      }
    }
  }
};
export default new CallController();
