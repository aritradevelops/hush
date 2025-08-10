
import { UUID } from "crypto";
import Call from "../entities/call";
import { Repository } from "../lib/repository";
import callQuery from "../queries/calls.query";

export class CallRepository extends Repository<typeof Call> {
  constructor() {
    super(Call);
  }

  async getRunningCalls(userId: UUID) {
    const query = callQuery.ongoing()
    const result = await this.entity.query(query, [userId])
    return [result, result.length] as [Call[], number]
  }
};
export default new CallRepository();
