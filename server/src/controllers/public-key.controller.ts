
import PublicKey from "../entities/public-key";
import publicKeyService, { PublicKeyService } from "../services/public-key.service";
import CrudController from "../utils/crud-controller";
export class PublicKeyController extends CrudController<typeof PublicKey, PublicKeyService> {
  constructor() {
    super(publicKeyService, PublicKey);
  }
};
export default new PublicKeyController();
  