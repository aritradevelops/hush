
import callRepository, { CallRepository } from "../repositories/call.repository";
import CrudService from "../utils/crud-service";

export class CallService extends CrudService<CallRepository> {
  constructor() {
    super(callRepository);
  }
}
export default new CallService();
  