
import Session from "../entities/session";
import sessionService, { SessionService } from "../services/session.service";
import CrudController from "../utils/crud-controller";
export class SessionController extends CrudController<typeof Session, SessionService> {
  constructor() {
    super(sessionService, Session);
  }
};
export default new SessionController();
  