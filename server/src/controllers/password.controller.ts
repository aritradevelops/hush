
import Password from "../entities/password";
import passwordService, { PasswordService } from "../services/password.service";
import CrudController from "../utils/crud-controller";
export class PasswordController extends CrudController<typeof Password, PasswordService> {
  constructor() {
    super(passwordService, Password);
  }
};
export default new PasswordController();
  