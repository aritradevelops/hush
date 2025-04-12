
import { Request, Response } from 'express';
import { Hook } from "../lib/hook-manager";
import logger from "../utils/logger";

class PasswordHook extends Hook {
  before(req: Request, res: Response, data: any): void {
    // logger.info("I was called before");
  }
  after(req: Request, res: Response, data: any): void {
    // logger.info("I was called after", data);
  }
}
export class List extends PasswordHook { }
export class View extends PasswordHook { }
export class Create extends PasswordHook { }
export class Update extends PasswordHook { }
export class Delete extends PasswordHook { }
export class Destroy extends PasswordHook { }
export class Restore extends PasswordHook { }
  