
import { Request, Response } from 'express';
import { Hook } from "../lib/hook-manager";
import logger from "../utils/logger";

class ResetPasswordRequestHook extends Hook {
  before(req: Request, res: Response, data: any): void {
    // logger.info("I was called before");
  }
  after(req: Request, res: Response, data: any): void {
    // logger.info("I was called after", data);
  }
}
export class List extends ResetPasswordRequestHook { }
export class View extends ResetPasswordRequestHook { }
export class Create extends ResetPasswordRequestHook { }
export class Update extends ResetPasswordRequestHook { }
export class Delete extends ResetPasswordRequestHook { }
export class Destroy extends ResetPasswordRequestHook { }
export class Restore extends ResetPasswordRequestHook { }
  