
import { plainToInstance } from "class-transformer";
import { GET, POST } from "../decorators/method";
import Contact from "../entities/contact";
import { BadRequestError } from "../errors/http/bad-request.error";
import contactService, { ContactService } from "../services/contact.service";
import CrudController from "../utils/crud-controller";
import { Request, Response } from "express";
import { HasId } from "../schemas/has-id";
import { sanitizeAsync } from "class-sanitizer";
import { PrimaryColumns } from "../lib/primary-columns";
import { ClauseMap } from "../utils/clauses";

export class ContactController extends CrudController<typeof Contact, ContactService> {
  constructor() {
    super(contactService, Contact);
  }
  @GET()
  async list(req: Request, res: Response): Promise<{ message: string; data: PrimaryColumns[]; info: { total: number; page: number; per_page: number; trash: boolean; order_by: string; order: "DESC" | "ASC"; search: string; where_clause: ClauseMap; select: string; }; }> {
    if (!req.query.where_clause) {
      req.query.where_clause = {}
    }
    //TODO: this will be handled by the scope
    // @ts-ignore
    req.query.where_clause['created_by'] = { $eq: req.user.id }
    return await super.list(req, res)
  }
};
export default new ContactController();
