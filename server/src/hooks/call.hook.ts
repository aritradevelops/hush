
import { Request, Response } from 'express';
import { Hook } from "../lib/hook-manager";
import logger from "../utils/logger";

class CallHook extends Hook {
  before(req: Request, res: Response, data: any): void {
    // logger.info("I was called before");
  }
  after(req: Request, res: Response, data: any): void {
    // logger.info("I was called after", data);
  }
}
export class List extends CallHook { }
export class View extends CallHook { }
export class Create extends CallHook { }
export class Update extends CallHook { }
export class Delete extends CallHook { }
export class Destroy extends CallHook { }
export class Restore extends CallHook { }
  