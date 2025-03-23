
import { UUID } from "node:crypto";
import Contact from "../entities/contact";
import { Repository } from "../lib/repository";
import contactQuery from "../queries/contact.query";

export class ContactRepository extends Repository<typeof Contact> {
  constructor() {
    super(Contact);
  }

  async addNewContact(userId: UUID, newContactId: UUID) {
    const query = contactQuery.addNewContact();
    const result = await this.entity.query(query, [userId, newContactId]);
    console.log(result);
    return result;
  }
};
export default new ContactRepository();
