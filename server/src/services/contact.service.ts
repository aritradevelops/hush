
import contactRepository, { ContactRepository } from "../repositories/contact.repository";
import CrudService from "../utils/crud-service";
import { Request, Response } from "express";
export class ContactService extends CrudService<ContactRepository> {
  constructor() {
    super(contactRepository);
  }
  async directChats(req: Request, res: Response) {
    return await this.repository.directChats(req.user?.id!)
  }
}
export default new ContactService();
