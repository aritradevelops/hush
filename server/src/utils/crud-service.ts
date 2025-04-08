import { Request, Response } from "express";
import { UnauthenticatedError } from "../errors/http/unauthenticated.error";
import type { PrimaryColumns } from "../lib/primary-columns";
import { Repository } from "../lib/repository";
import Service from "../lib/service";
import type { ListParams } from "../schemas/list-params";
import { UUID } from "crypto";
import { IsNull } from "typeorm";
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
    const scopedQuery = this.getScopedFilter(req)
    if (!user) throw new UnauthenticatedError();
    const result = await this.repository.create({ ...data, created_by: user.id, ...scopedQuery });
    // ugly but easy fix
    delete result.raw[0].search;
    return result.raw[0];
  }

  async view(req: Request, res: Response, id: UUID) {
    const scopeFilter = this.getScopedFilter(req);
    return await this.repository.view({ id, deleted_at: IsNull(), ...scopeFilter });
  }

  async update(req: Request, res: Response, id: UUID, data: any) {
    const user = req.user;
    const scopeFilter = this.getScopedFilter(req);
    if (!user) throw new UnauthenticatedError();
    return await this.repository.update({ id, ...scopeFilter }, { ...data, updated_by: user.id });
  }
  async delete(req: Request, res: Response, id: UUID) {
    const user = req.user;
    const scopeFilter = this.getScopedFilter(req);
    if (!user) throw new UnauthenticatedError();
    return await this.repository.update({ id, ...scopeFilter }, { deleted_at: new Date(), deleted_by: user.id });
  }
  async restore(req: Request, res: Response, id: UUID) {
    const scopeFilter = this.getScopedFilter(req);
    return await this.repository.update({ id, ...scopeFilter }, { deleted_at: null });
  }
  async destroy(req: Request, res: Response, id: string) {
    const scopeFilter = this.getScopedFilter(req);
    return await this.repository.destroy({ id, ...scopeFilter });
  }
}

export default CrudService;