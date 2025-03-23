
import { plainToInstance } from "class-transformer";
import { GET, POST } from "../decorators/method";
import Contact from "../entities/contact";
import { BadRequestError } from "../errors/http/bad-request.error";
import contactService, { ContactService } from "../services/contact.service";
import CrudController from "../utils/crud-controller";
import { Request, Response } from "express";
import { HasId } from "../schemas/has-id";
import { sanitizeAsync } from "class-sanitizer";

export class ContactController extends CrudController<typeof Contact, ContactService> {
  constructor() {
    super(contactService, Contact);
  }

  @POST()
  async addContact(req: Request, res: Response) {
    const instance = plainToInstance(HasId, req.params);
    const sanitized = await sanitizeAsync(instance);
    const contact = await this.service.addContact(req, res, sanitized.id)
    return {
      message: req.t('add_contact'),
      data: contact
    }
  }

};
export default new ContactController();
