
import { IsNull, MoreThan } from "typeorm";
import resetPasswordRequestRepository, { ResetPasswordRequestRepository } from "../repositories/reset-password-request.repository";
import CrudService from "../utils/crud-service";
import { Request, Response } from "express";

export class ResetPasswordRequestService extends CrudService<ResetPasswordRequestRepository> {
  constructor() {
    super(resetPasswordRequestRepository);
  }
  async getValidRequestByHash(req: Request, res: Response, hash: string) {
    return await this.repository.view({ hash, expires_at: MoreThan(new Date()), deleted_at: IsNull() })
  }
}
export default new ResetPasswordRequestService();
