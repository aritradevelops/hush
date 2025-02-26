
import Session from "../entities/session";
import { Repository } from "../lib/repository";

export class SessionRepository extends Repository<typeof Session> {
  constructor() {
    super(Session);
  }
};
export default new SessionRepository();
  