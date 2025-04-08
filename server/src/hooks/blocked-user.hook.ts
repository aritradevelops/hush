
import { Request, Response } from 'express';
import { Hook } from "../lib/hook-manager";
import logger from "../utils/logger";

class BlockedUserHook extends Hook {
  before(req: Request, res: Response, data: any): void {
    // logger.info("I was called before");
  }
  after(req: Request, res: Response, data: any): void {
    // logger.info("I was called after", data);
  }
}
export class List extends BlockedUserHook { }
export class View extends BlockedUserHook { }
export class Create extends BlockedUserHook { }
export class Update extends BlockedUserHook { }
export class Delete extends BlockedUserHook { }
export class Destroy extends BlockedUserHook { }
export class Restore extends BlockedUserHook { }
  