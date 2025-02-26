
import { In } from "typeorm";
import User from "../entities/user";
import { Repository } from "../lib/repository";

export class UserRepository extends Repository<typeof User> {
  constructor() {
    super(User);
  }
  getContacts(contacts: string[]) {
    const qb = this.entity.createQueryBuilder(this.entity.name)
    qb.select(['first_name', 'last_name', 'email', 'id'].map(e => (this.entity.name + '.' + e)))
      .where({ id: In(contacts) })
    return qb.getMany();
  }
  addContact(id: string, contact: string) {
    const qb = this.entity.createQueryBuilder(this.entity.name)
      .update(User)
      .set({ contacts: () => `array_append(contacts, '${contact}')` })
      .where("id = :id", { id })

    return qb.execute();
  }
};
export default new UserRepository();
