
import Contact from "../entities/contact";
import { Repository } from "../lib/repository";

export class ContactRepository extends Repository<typeof Contact> {
  constructor() {
    super(Contact);
  }
};
export default new ContactRepository();
