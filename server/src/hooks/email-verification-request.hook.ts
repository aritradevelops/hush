
import { Request, Response } from 'express';
import { Hook } from "../lib/hook-manager";
import logger from "../utils/logger";

class EmailVerificationRequestHook extends Hook {
  before(req: Request, res: Response, data: any): void {
    // logger.info("I was called before");
  }
  after(req: Request, res: Response, data: any): void {
    // logger.info("I was called after", data);
  }
}
export class List extends EmailVerificationRequestHook { }
export class View extends EmailVerificationRequestHook { }
export class Create extends EmailVerificationRequestHook { }
export class Update extends EmailVerificationRequestHook { }
export class Delete extends EmailVerificationRequestHook { }
export class Destroy extends EmailVerificationRequestHook { }
export class Restore extends EmailVerificationRequestHook { }
  