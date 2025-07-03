
import Call from "../entities/call";
import { Repository } from "../lib/repository";

export class CallRepository extends Repository<typeof Call> {
  constructor() {
    super(Call);
  }
};
export default new CallRepository();
  