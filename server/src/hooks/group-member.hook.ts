
import { Request, Response } from 'express';
import { Hook } from "../lib/hook-manager";
import logger from "../utils/logger";

class GroupMemberHook extends Hook {
  before(req: Request, res: Response, data: any): void {
    // logger.info("I was called before");
  }
  after(req: Request, res: Response, data: any): void {
    // logger.info("I was called after", data);
  }
}
export class List extends GroupMemberHook { }
export class View extends GroupMemberHook { }
export class Create extends GroupMemberHook { }
export class Update extends GroupMemberHook { }
export class Delete extends GroupMemberHook { }
export class Destroy extends GroupMemberHook { }
export class Restore extends GroupMemberHook { }
  