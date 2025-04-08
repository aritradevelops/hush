
import publicKeyRepository, { PublicKeyRepository } from "../repositories/public-key.repository";
import CrudService from "../utils/crud-service";

export class PublicKeyService extends CrudService<PublicKeyRepository> {
  constructor() {
    super(publicKeyRepository);
  }
}
export default new PublicKeyService();
  