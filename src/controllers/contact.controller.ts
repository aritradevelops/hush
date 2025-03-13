
import Contact from "../entities/contact";
import contactService, { ContactService } from "../services/contact.service";
import CrudController from "../utils/crud-controller";
export class ContactController extends CrudController<typeof Contact, ContactService> {
  constructor() {
    super(contactService, Contact);
  }
};
export default new ContactController();
  