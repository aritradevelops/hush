
import Call from "../entities/call";
import callService, { CallService } from "../services/call.service";
import CrudController from "../utils/crud-controller";
export class CallController extends CrudController<typeof Call, CallService> {
  constructor() {
    super(callService, Call);
  }
};
export default new CallController();
  