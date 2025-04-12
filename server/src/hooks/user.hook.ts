
import { Request, Response } from 'express';
import { Hook } from "../lib/hook-manager";
import logger from "../utils/logger";

class UserHook extends Hook {
  before(req: Request, res: Response, data: any): void {
    // logger.info("I was called before");
  }
  after(req: Request, res: Response, data: any): void {
    // console.log("I was called after", data);
  }
}
export class List extends UserHook { }
export class View extends UserHook { }
export class Create extends UserHook { }
export class Update extends UserHook { }
export class Delete extends UserHook { }
export class Destroy extends UserHook { }
export class Restore extends UserHook { }
