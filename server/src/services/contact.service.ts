
import { Request, Response } from "express";
import { UUID } from "node:crypto";
import contactRepository, { ContactRepository } from "../repositories/contact.repository";
import CrudService from "../utils/crud-service";
export class ContactService extends CrudService<ContactRepository> {
  constructor() {
    super(contactRepository);
  }

  async addContact(req: Request, res: Response, id: UUID) {
    const userId = req.user?.id!
    const result = await this.repository.addNewContact(userId, id)
    // TODO: send socket event to the new contact
    return result
  }
}
export default new ContactService();
