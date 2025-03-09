
import { Not } from "typeorm";
import { GET } from "../decorators/method";
import Oauth from "../entities/oauth";
import oauthService, { OauthService } from "../services/oauth.service";
import CrudController from "../utils/crud-controller";
import { Request, Response } from 'express';
import { NotFoundError } from "../errors/http/not-found.error";
export class OauthController extends CrudController<typeof Oauth, OauthService> {
  constructor() {
    super(oauthService, Oauth);
  }
  @GET()
  async callback(req:Request, res: Response){
    switch(req.query.id){
      case 'google':{
        return await this.service.handleGoogleCallback(req, res);
      }
      case 'facebook':{
        // TODO:
      }
      default: throw new NotFoundError()
    }
  }
};
export default new OauthController();
  