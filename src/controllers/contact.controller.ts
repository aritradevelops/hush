
import { GET } from "../decorators/method";
import Contact from "../entities/contact";
import contactService, { ContactService } from "../services/contact.service";
import CrudController from "../utils/crud-controller";
import { Request, Response } from "express";

export class ContactController extends CrudController<typeof Contact, ContactService> {
  constructor() {
    super(contactService, Contact);
  }
  @GET()
  async directChats(req: Request, res: Response) {
    const result = this.service.directChats(req, res)
    return {
      message: req.t('direct_chats'),
      data: result
    }
  }
};
export default new ContactController();
