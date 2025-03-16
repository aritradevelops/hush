
import { Not } from "typeorm";
import { GET } from "../decorators/method";
import Oauth from "../entities/oauth";
import oauthService, { OauthService } from "../services/oauth.service";
import CrudController from "../utils/crud-controller";
import { Request, Response } from 'express';
import { NotFoundError } from "../errors/http/not-found.error";
import { JwtService } from "../services/jwt.service";
import env from "../lib/env";
import Route from "../decorators/route";
@Route('oauth')
export class OauthController extends CrudController<typeof Oauth, OauthService> {
  constructor() {
    super(oauthService, Oauth);
  }
  @GET()
  async callback(req: Request, res: Response) {
    let result: Awaited<ReturnType<JwtService['sign']>>
    switch (req.params.id) {
      case 'google': {
        result = await this.service.handleGoogleCallback(req, res);
        break;
      }
      case 'facebook': {
        result = await this.service.handleFacebookCallback(req, res);
        break;
      }
      default: {
        throw new NotFoundError()
      }
    }
    const { access_token, refresh_token, access_token_expiry, refresh_token_expiry } = result
    const clientUrl = new URL(env.get('CLIENT_URL'))
    res.cookie('access_token', access_token, { httpOnly: true, expires: access_token_expiry, secure: env.get('NODE_ENV') === 'production', maxAge: (access_token_expiry.getTime() - Date.now()), sameSite: env.get('NODE_ENV') === 'production' ? "none" : true, domain: clientUrl.hostname });
    res.cookie('refresh_token', refresh_token, { httpOnly: true, expires: refresh_token_expiry, secure: env.get('NODE_ENV') === 'production', maxAge: (refresh_token_expiry.getTime() - Date.now()), sameSite: env.get('NODE_ENV') === 'production' ? "none" : true, domain: clientUrl.hostname });
    res.redirect(`${env.get('CLIENT_URL')}/chats`)
  }
};
export default new OauthController();
