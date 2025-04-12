
import ResetPasswordRequest from "../entities/reset-password-request";
import resetPasswordRequestService, { ResetPasswordRequestService } from "../services/reset-password-request.service";
import CrudController from "../utils/crud-controller";
export class ResetPasswordRequestController extends CrudController<typeof ResetPasswordRequest, ResetPasswordRequestService> {
  constructor() {
    super(resetPasswordRequestService, ResetPasswordRequest);
  }
};
export default new ResetPasswordRequestController();
  