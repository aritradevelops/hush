
import EmailVerificationRequest from "../entities/email-verification-request";
import emailVerificationRequestService, { EmailVerificationRequestService } from "../services/email-verification-request.service";
import CrudController from "../utils/crud-controller";
export class EmailVerificationRequestController extends CrudController<typeof EmailVerificationRequest, EmailVerificationRequestService> {
  constructor() {
    super(emailVerificationRequestService, EmailVerificationRequest);
  }
};
export default new EmailVerificationRequestController();
  