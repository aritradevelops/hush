import { sanitizeAsync } from "class-sanitizer";
import { plainToInstance } from "class-transformer";
import { Request, Response } from "express";
import { DELETE, GET, PATCH, POST, PUT } from "../decorators/method";
import { NotFoundError } from "../errors/http/not-found.error";
import Controller from "../lib/controller";
import type { PrimaryColumns } from "../lib/primary-columns";
import { HasId } from "../schemas/has-id";
import { ListParams } from "../schemas/list-params";
import type CrudService from "./crud-service";
import { capitalize, pluralize, singularize } from "inflection";
import { kebabToCamel, kebabToPascal } from "./string";
export default abstract class CrudController<U extends typeof PrimaryColumns = typeof PrimaryColumns, V extends CrudService = CrudService> extends Controller<U, V> {
  constructor(protected service: V, protected schema: U) {
    super(service, schema);
  }

  @GET()
  async list(req: Request, res: Response) {
    const queryInstance = plainToInstance(ListParams, req.query);
    const sanitizedQuery = await sanitizeAsync(queryInstance);
    const [data, total] = await this.service.list(req, res, sanitizedQuery);
    return {
      message: req.t('controller.list', { module: kebabToPascal(req.params.module as string) }),
      data,
      info: {
        total,
        page: sanitizedQuery.page,
        per_page: sanitizedQuery.per_page,
        trash: sanitizedQuery.trash,
        order_by: sanitizedQuery.order_by,
        order: sanitizedQuery.order,
        search: sanitizedQuery.search,
        where_clause: sanitizedQuery.where_clause,
        select: sanitizedQuery.select,
      }
    };
  }
  @POST()
  async create(req: Request, res: Response) {
    const sanitized = await this._validate(req.body, req.t);
    const created = await this.service.create(req, res, sanitized);
    res.status(201);
    return {
      message: req.t('controller.create', { module: singularize(kebabToPascal(req.params.module as string)) }),
      data: created
    };
  }
  @GET()
  async view(req: Request, res: Response) {
    const instance = plainToInstance(HasId, req.query);
    const sanitized = await sanitizeAsync(instance);
    const data = await this.service.view(req, res, sanitized.id);
    if (!data) throw new NotFoundError();
    return {
      message: req.t('controller.view', { module: singularize(kebabToPascal(req.params.module as string)) }),
      data
    };
  }
  @PUT()
  async update(req: Request, res: Response) {
    const instance = plainToInstance(HasId, req.query);
    const sanitizedQuery = await sanitizeAsync(instance);
    const body = await req.body;
    const sanitized = await this._validate(body, req.t, true);
    const data = await this.service.update(req, res, sanitizedQuery.id, sanitized);
    if (!data.affected) throw new NotFoundError();
    return {
      message: req.t('controller.update', { module: singularize(kebabToPascal(req.params.module as string)) }),
      data: data.raw
    };
  }
  @DELETE()
  async delete(req: Request, res: Response) {
    const instance = plainToInstance(HasId, req.query);
    const sanitized = await sanitizeAsync(instance);
    const data = await this.service.delete(req, res, sanitized.id);
    if (!data.affected) throw new NotFoundError();
    return {
      message: req.t('controller.delete', { module: singularize(kebabToPascal(req.params.module as string)) }),
      data: data.raw
    };
  }
  @PATCH()
  async restore(req: Request, res: Response) {
    const instance = plainToInstance(HasId, req.query);
    const sanitized = await sanitizeAsync(instance);
    const data = await this.service.restore(req, res, sanitized.id);
    if (!data.affected) throw new NotFoundError();
    return {
      message: req.t('controller.delete', { module: singularize(kebabToPascal(req.params.module as string)) }),
      data: data.raw
    };
  }
  @DELETE()
  async destroy(req: Request, res: Response) {
    const instance = plainToInstance(HasId, req.query);
    const sanitized = await sanitizeAsync(instance);
    const data = await this.service.destroy(req, res, sanitized.id);
    if (!data.affected) throw new NotFoundError();
    return {
      message: req.t('controller.delete', { module: singularize(kebabToPascal(req.params.module as string)) }),
      data: data.raw
    };
  }
}