import { UnauthenticatedError } from "../errors/http/unauthenticated.error";
import type { Repository } from "./repository";
import { Request } from "express";
export default class Service<R extends Repository = Repository> {
  constructor(protected repository: R) { }
  protected getScopedClause(req: Request) {
    const user = req.user;
    switch (user?.scope) {
      case 'ROOT':
        return {};
      case 'ACCOUNT':
        return { acc_id: user.acc_id };
      case 'ORGANIZATION':
        return { org_id: user?.org_id };
      case 'SELF':
        return { created_by: user.id };
      default:
        throw new UnauthenticatedError();
    }
  }
}