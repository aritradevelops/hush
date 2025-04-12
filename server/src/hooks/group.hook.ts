
import { Request, Response } from 'express';
import { Hook } from "../lib/hook-manager";
import logger from "../utils/logger";

class GroupHook extends Hook {
  before(req: Request, res: Response, data: any): void {
    // logger.info("I was called before");
  }
  after(req: Request, res: Response, data: any): void {
    // logger.info("I was called after", data);
  }
}
export class List extends GroupHook { }
export class View extends GroupHook { }
export class Create extends GroupHook { }
export class Update extends GroupHook { }
export class Delete extends GroupHook { }
export class Destroy extends GroupHook { }
export class Restore extends GroupHook { }
  