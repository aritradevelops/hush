
import callRepository, { CallRepository } from "../repositories/call.repository";
import CrudService from "../utils/crud-service";
import { Request, Response } from "express";
export class CallService extends CrudService<CallRepository> {
  constructor() {
    super(callRepository);
  }

  async ongoing(req: Request, res: Response) {
    const userId = req.user?.id!
    return await this.repository.getRunningCalls(userId)
  }
}
export default new CallService();
