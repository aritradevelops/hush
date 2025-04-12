
import { Request, Response } from 'express';
import { Hook } from "../lib/hook-manager";
import logger from "../utils/logger";

class ChatReactionHook extends Hook {
  before(req: Request, res: Response, data: any): void {
    // logger.info("I was called before");
  }
  after(req: Request, res: Response, data: any): void {
    // logger.info("I was called after", data);
  }
}
export class List extends ChatReactionHook { }
export class View extends ChatReactionHook { }
export class Create extends ChatReactionHook { }
export class Update extends ChatReactionHook { }
export class Delete extends ChatReactionHook { }
export class Destroy extends ChatReactionHook { }
export class Restore extends ChatReactionHook { }
  