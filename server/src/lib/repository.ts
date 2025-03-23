import { DeepPartial, FindOptionsWhere } from "typeorm";
import type { ListParams } from "../schemas/list-params";
import { PrimaryColumns } from "./primary-columns";
import { Clause } from "../utils/clauses";

export abstract class Repository<T extends typeof PrimaryColumns = typeof PrimaryColumns> {
  constructor(protected entity: T) { }

  async list(query: ListParams) {
    const qb = this.getListQuery(query)
    qb.orderBy(query.order_by, query.order);
    qb.skip((query.page - 1) * query.per_page);
    qb.take(query.per_page);
    const result = await qb.getManyAndCount();
    return result;
  }
  async create(data: DeepPartial<InstanceType<T>>) {

    return await this.entity
      .createQueryBuilder()
      .insert()
      .into(this.entity)
      .values(data)
      .returning('*')
      .execute()
  }
  async view(filter: FindOptionsWhere<InstanceType<T>>) {
    return await this.entity.findOne({ where: filter }) as InstanceType<T> | null;
  }
  async update(filter: FindOptionsWhere<InstanceType<T>>, data: Partial<InstanceType<T>>) {
    return await this.entity.update(filter, data);
  }
  async destroy(filter: any) {
    return await this.entity.delete(filter);
  }

  protected getListQuery(query: ListParams) {
    console.log(query)
    const qb = this.entity.createQueryBuilder(this.entity.name)
      // @ts-ignore
      .select(query.select ? query.select.split(',').map(field => (this.entity.name + '.' + field)) : query.select);
    if (query.search) {
      qb.where("search @@ to_tsquery(:search)", { search: query.search.trim().split(" ").join(":* & ").concat(":*") });
    }
    if (Object.keys(query.where_clause).length) {
      Object.keys(query.where_clause).forEach((key) => {
        const clause = Clause.build(query.where_clause[key]).toSql(this.getColumnName(key))
        console.log(clause)
        qb.andWhere(clause)
      });
    }
    if (query.trash) {
      qb.andWhere(`deleted_at IS NOT NULL`);
    } else {
      qb.andWhere(`deleted_at IS NULL`);
    }
    return qb
  }
  public getColumnName(key: string) {
    return [this.entity.name, key].join('.')
  }
}