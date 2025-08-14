
import { Request, Response } from 'express';
import { Hook } from "../lib/hook-manager";
import logger from "../utils/logger";

class ChatHook extends Hook {
  before(req: Request, res: Response, data: any): void {
    // logger.info("I was called before");
  }
  after(req: Request, res: Response, data: any): void {
    // console.debug("I was called after", data);
  }
}
export class List extends ChatHook { }
export class View extends ChatHook { }
export class Create extends ChatHook { }
export class Update extends ChatHook { }
export class Delete extends ChatHook { }
export class Destroy extends ChatHook { }
export class Restore extends ChatHook { }
