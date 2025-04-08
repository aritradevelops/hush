
import EmailVerificationRequest from "../entities/email-verification-request";
import { Repository } from "../lib/repository";

export class EmailVerificationRequestRepository extends Repository<typeof EmailVerificationRequest> {
  constructor() {
    super(EmailVerificationRequest);
  }
};
export default new EmailVerificationRequestRepository();
  