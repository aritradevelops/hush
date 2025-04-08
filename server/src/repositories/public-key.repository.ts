
import PublicKey from "../entities/public-key";
import { Repository } from "../lib/repository";

export class PublicKeyRepository extends Repository<typeof PublicKey> {
  constructor() {
    super(PublicKey);
  }
};
export default new PublicKeyRepository();
  