
import Secret from "../entities/secret";
import { Repository } from "../lib/repository";

export class SecretRepository extends Repository<typeof Secret> {
  constructor() {
    super(Secret);
  }
};
export default new SecretRepository();
  