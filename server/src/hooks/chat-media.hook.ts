
import { Request, Response } from 'express';
import { Hook } from "../lib/hook-manager";
import logger from "../utils/logger";

class ChatMediaHook extends Hook {
  before(req: Request, res: Response, data: any): void {
    // logger.info("I was called before");
  }
  after(req: Request, res: Response, data: any): void {
    // logger.info("I was called after", data);
  }
}
export class List extends ChatMediaHook { }
export class View extends ChatMediaHook { }
export class Create extends ChatMediaHook { }
export class Update extends ChatMediaHook { }
export class Delete extends ChatMediaHook { }
export class Destroy extends ChatMediaHook { }
export class Restore extends ChatMediaHook { }
  