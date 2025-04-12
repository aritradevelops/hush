
import ResetPasswordRequest from "../entities/reset-password-request";
import { Repository } from "../lib/repository";

export class ResetPasswordRequestRepository extends Repository<typeof ResetPasswordRequest> {
  constructor() {
    super(ResetPasswordRequest);
  }
};
export default new ResetPasswordRequestRepository();
  