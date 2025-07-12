
import Call from "../entities/call";
import { Repository } from "../lib/repository";
import callQuery from "../queries/call.query";

export class CallRepository extends Repository<typeof Call> {
  constructor() {
    super(Call);
  }

  async getActiveCalls(userId: string) {
    const query = callQuery.getActiveCalls()
    const result = await this.entity.query(query, [userId]);
    return result as Call[]
  }
};
export default new CallRepository();
