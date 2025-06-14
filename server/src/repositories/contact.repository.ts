
import Contact from "../entities/contact";
import User from "../entities/user";
import { PrimaryColumns } from "../lib/primary-columns";
import { Repository } from "../lib/repository";
import { ListParams } from "../schemas/list-params";

export class ContactRepository extends Repository<typeof Contact> {
  constructor() {
    super(Contact);
  }
  async list(query: ListParams): Promise<[PrimaryColumns[], number]> {
    const qb = this.getListQuery(query)
    qb.leftJoinAndMapOne(`${this.entity.name}.user`, User, "User", `User.id = ${this.entity.name}.user_id`);
    qb.orderBy(this.getColumnName(query.order_by), query.order);
    qb.skip((query.page - 1) * query.per_page);
    qb.take(query.per_page);
    const result = await qb.getManyAndCount();
    return result;
  }
};
export default new ContactRepository();
