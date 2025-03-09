
import Oauth from "../entities/oauth";
import { Repository } from "../lib/repository";

export class OauthRepository extends Repository<typeof Oauth> {
  constructor() {
    super(Oauth);
  }

  async createIfNotExists
};
export default new OauthRepository();
  