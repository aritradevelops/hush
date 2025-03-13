
import contactRepository, { ContactRepository } from "../repositories/contact.repository";
import CrudService from "../utils/crud-service";

export class ContactService extends CrudService<ContactRepository> {
  constructor() {
    super(contactRepository);
  }
}
export default new ContactService();
  