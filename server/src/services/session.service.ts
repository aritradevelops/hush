
import { IsNull, MoreThan } from "typeorm";
import sessionRepository, { SessionRepository } from "../repositories/session.repository";
import CrudService from "../utils/crud-service";
import ms from "ms";
import { Request, Response } from "express";

export class SessionService extends CrudService<SessionRepository> {
  constructor() {
    super(sessionRepository);
  }
  // TODO: add checking for ip and user agent
  async getActiveSession(req: Request, res: Response, { refreshToken }: { refreshToken: string }) {
    return await this.repository.view({ refresh_token: refreshToken, deleted_at: IsNull(), created_at: MoreThan(new Date(Date.now() - ms('15d'))) })
  }
}
export default new SessionService();
