import { UnauthenticatedError } from "../errors/http/unauthenticated.error";
import { ClauseMap } from "../utils/clauses";
import type { Repository } from "./repository";
import { Request } from "express";
export default class Service<R extends Repository = Repository> {
  constructor(protected repository: R) { }
  protected getScopedClause(req: Request): ClauseMap {
    const user = req.user;
    switch (user?.scope) {
      case 'ROOT':
        return {};
      case 'ACCOUNT':
        return { acc_id: { $eq: user.acc_id } };
      case 'ORGANIZATION':
        return { org_id: { $eq: user?.org_id! } };
      case 'SELF':
        return { created_by: { $eq: user.id } };
      default:
        throw new UnauthenticatedError();
    }
  }
}