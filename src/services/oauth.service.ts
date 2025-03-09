
import env from "../lib/env";
import oauthRepository, { OauthRepository } from "../repositories/oauth.repository";
import CrudService from "../utils/crud-service";
import { Request, Response } from 'express';
import axios from "axios";
import qs from "qs";
import logger from "../utils/logger";
import { InternalServerError } from "../errors/http/internal-server.error";

interface GoogleTokensResult {
  access_token: string;
  expires_in: Number;
  refresh_token: string;
  scope: string;
  id_token: string;
}
interface GoogleUserResult {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export class OauthService extends CrudService<OauthRepository> {
  constructor() {
    super(oauthRepository);
  }
  async handleGoogleCallback(req: Request, res: Response) {
    // TODO: fetch from config
    const url = "https://oauth2.googleapis.com/token";

    const values = {
      code: req.query.code as string,
      client_id: env.get('GOOGLE_CLIENT_ID'),
      client_secret: env.get('GOOGLE_CLIENT_SECRET'),
      redirect_uri: env.get('GOOGLE_OAUTH_REDIRECT_URI'),
      grant_type: "authorization_code",
    };

    const resp = await axios.post<GoogleTokensResult>(
      url,
      qs.stringify(values),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    if (resp.status !== 200) {
      logger.error(resp.data);
      throw new InternalServerError()
    }
    const { access_token, id_token } = resp.data;
      const resp2 = await axios.get<GoogleUserResult>(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
        {
          headers: {
            Authorization: `Bearer ${id_token}`,
          },
        }
      );
    
  }
}
export default new OauthService();
