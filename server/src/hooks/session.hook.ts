
import { Request, Response } from 'express';
import { Hook } from "../lib/hook-manager";
import logger from "../utils/logger";

class SessionHook extends Hook {
  before(req: Request, res: Response, data: any): void {
    // logger.info("I was called before");
  }
  after(req: Request, res: Response, data: any): void {
    // console.log("I was called after", data);
  }
}
export class List extends SessionHook { }
export class View extends SessionHook { }
export class Create extends SessionHook { }
export class Update extends SessionHook { }
export class Delete extends SessionHook { }
export class Destroy extends SessionHook { }
export class Restore extends SessionHook { }
