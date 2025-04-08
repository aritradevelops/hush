
import { Request, Response } from 'express';
import { Hook } from "../lib/hook-manager";
import logger from "../utils/logger";

class UserChatInteractionHook extends Hook {
  before(req: Request, res: Response, data: any): void {
    // logger.info("I was called before");
  }
  after(req: Request, res: Response, data: any): void {
    // logger.info("I was called after", data);
  }
}
export class List extends UserChatInteractionHook { }
export class View extends UserChatInteractionHook { }
export class Create extends UserChatInteractionHook { }
export class Update extends UserChatInteractionHook { }
export class Delete extends UserChatInteractionHook { }
export class Destroy extends UserChatInteractionHook { }
export class Restore extends UserChatInteractionHook { }
  