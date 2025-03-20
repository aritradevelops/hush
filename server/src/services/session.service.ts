
import sessionRepository, { SessionRepository } from "../repositories/session.repository";
import CrudService from "../utils/crud-service";

export class SessionService extends CrudService<SessionRepository> {
  constructor() {
    super(sessionRepository);
  }
}
export default new SessionService();
  