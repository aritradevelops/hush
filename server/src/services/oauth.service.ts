
import axios from "axios";
import { Request, Response } from 'express';
import qs from "qs";
import User from "../entities/user";
import { InternalServerError } from "../errors/http/internal-server.error";
import env from "../lib/env";
import userRepository, { UserRepository } from "../repositories/user.repository";
import CrudService from "../utils/crud-service";
import logger from "../utils/logger";
import jwtService from "./jwt.service";
// TODO: build a OauthProvider interface
// TODO: GoogleOauthProvider, FacebookOauthProvider will provide the concrete implementations
export interface GoogleTokensResult {
  access_token: string;
  expires_in: Number;
  refresh_token: string;
  scope: string;
  id_token: string;
}
export interface GoogleUserResult {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export interface FacebookTokensResult {
  access_token: string,
  token_type: "bearer",
  expires_in: number
}

export interface FacebookUserResult {
  id: string,
  name: string,
  email: string,
  picture: {
    data: {
      height: number,
      is_silhouette: boolean,
      url: string,
      width: number
    }
  }
}

export class OauthService extends CrudService<UserRepository> {
  constructor() {
    super(userRepository);
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
    const user = await this.syncAndFetchGoolgeUser(resp2.data);
    return await jwtService.sign(user)
  }

  async handleFacebookCallback(req: Request, res: Response) {
    const url = "https://graph.facebook.com/v18.0/oauth/access_token";
    const values = {
      client_id: env.get('FACEBOOK_CLIENT_ID'),
      redirect_uri: env.get('FACEBOOK_OAUTH_REDIRECT_URI'),
      client_secret: env.get('FACEBOOK_CLIENT_SECRET'),
      code: req.query.code as string,
    }
    const resp = await axios.post<FacebookTokensResult>(
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
    const resp2 = await axios.get<FacebookUserResult>(
      `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${resp.data.access_token}`
    );
    const user = await this.syncAndFetchFacebookUser(resp2.data);
    return await jwtService.sign(user)
  }
  private async syncAndFetchGoolgeUser(guser: GoogleUserResult) {
    let user = await this.repository.view({ email: guser.email })
    if (!user) {
      const result = await this.repository.create({
        email: guser.email,
        name: guser.name,
        avatar: guser.picture,
        created_by: '9d78bc6f-8fba-4387-81b2-f53d4b41e5b4'
      })
      user = result.raw[0] as User
    }
    return user
  }
  private async syncAndFetchFacebookUser(fuser: FacebookUserResult) {
    let user = await this.repository.view({ email: fuser.email })
    if (!user) {
      const result = await this.repository.create({
        email: fuser.email,
        name: fuser.name,
        avatar: fuser.picture.data.url,
        created_by: '9d78bc6f-8fba-4387-81b2-f53d4b41e5b4'
      })
      user = result.raw[0] as User
    }
    return user
  }
}
export default new OauthService();
