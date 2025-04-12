
import { Request, Response } from 'express';
import { Hook } from "../lib/hook-manager";
import logger from "../utils/logger";

class OauthHook extends Hook {
  before(req: Request, res: Response, data: any): void {
    // logger.info("I was called before");
  }
  after(req: Request, res: Response, data: any): void {
    // logger.info("I was called after", data);
  }
}
export class List extends OauthHook { }
export class View extends OauthHook { }
export class Create extends OauthHook { }
export class Update extends OauthHook { }
export class Delete extends OauthHook { }
export class Destroy extends OauthHook { }
export class Restore extends OauthHook { }
  