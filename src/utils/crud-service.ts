import { Request, Response } from "express";
import { UnauthenticatedError } from "../errors/http/unauthenticated.error";
import type { PrimaryColumns } from "../lib/primary-columns";
import { Repository } from "../lib/repository";
import Service from "../lib/service";
import type { ListParams } from "../schemas/list-params";
abstract class CrudService<R extends Repository = Repository<typeof PrimaryColumns>> extends Service<R> {
  constructor(repository: R) {
    super(repository);
  }
  async list(req: Request, res: Response, listParams: ListParams) {
    const scopeClause = this.getScopedClause(req);
    listParams.where_clause = { ...listParams.where_clause, ...scopeClause };
    return await this.repository.list(listParams);
  }
  async create(req: Request, res: Response, data: any) {
    const user = req.user;
    if (!user) throw new UnauthenticatedError();
    const result = await this.repository.create({ ...data, acc_id: user.acc_id, org_id: user.org_id, created_by: user.id });
    // ugly but easy fix
    delete result.raw[0].search;
    return result.raw[0];
  }

  async view(req: Request, res: Response, id: string) {
    const scopeClause = this.getScopedClause(req);
    return await this.repository.view({ id, ...scopeClause });
  }

  async update(req: Request, res: Response, id: string, data: any) {
    const user = req.user;
    const scopeClause = this.getScopedClause(req);
    if (!user) throw new UnauthenticatedError();
    return await this.repository.update({ id, ...scopeClause }, { ...data, updated_by: user.id });
  }
  async delete(req: Request, res: Response, id: string) {
    const user = req.user;
    const scopeClause = this.getScopedClause(req);
    if (!user) throw new UnauthenticatedError();
    return await this.repository.update({ id, ...scopeClause }, { deleted_at: new Date(), deleted_by: user.id });
  }
  async restore(req: Request, res: Response, id: string) {
    const scopeClause = this.getScopedClause(req);
    return await this.repository.update({ id, ...scopeClause }, { deleted_at: null });
  }
  async destroy(req: Request, res: Response, id: string) {
    const scopeClause = this.getScopedClause(req);
    return await this.repository.destroy({ id, ...scopeClause });
  }
}

export default CrudService;