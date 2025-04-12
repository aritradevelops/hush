
import { IsNull, MoreThan } from "typeorm";
import emailVerificationRequestRepository, { EmailVerificationRequestRepository } from "../repositories/email-verification-request.repository";
import CrudService from "../utils/crud-service";
import { Request, Response } from "express";
export class EmailVerificationRequestService extends CrudService<EmailVerificationRequestRepository> {
  constructor() {
    super(emailVerificationRequestRepository);
  }
  async getValidRequestByHash(req: Request, res: Response, hash: string) {
    return await this.repository.view({ hash, expires_at: MoreThan(new Date()), deleted_at: IsNull() })
  }
}
export default new EmailVerificationRequestService();
