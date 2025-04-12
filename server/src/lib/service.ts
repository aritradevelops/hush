import { UnauthenticatedError } from "../errors/http/unauthenticated.error";
import { ClauseMap } from "../utils/clauses";
import type { Repository } from "./repository";
import { Request } from "express";
export default class Service<R extends Repository = Repository> {
  constructor(protected repository: R) { }
  /**  returns scoped query in where clause format */
  protected getScopedClause(req: Request): ClauseMap {
    const user = req.user;
    switch (user?.scope) {
      case 'ALL':
        return {};
      case 'SELF':
        return { created_by: { $eq: user.id } };
      default:
        throw new UnauthenticatedError();
    }
  }
  /** returns scoped query in typeorm query format */
  protected getScopedFilter(req: Request): Object {
    const user = req.user;
    switch (user?.scope) {
      case 'ALL':
        return {};
      case 'SELF':
        return { created_by: user.id };
      default:
        throw new UnauthenticatedError();
    }
  }
}