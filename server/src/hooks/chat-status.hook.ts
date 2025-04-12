
import { Request, Response } from 'express';
import { Hook } from "../lib/hook-manager";
import logger from "../utils/logger";

class ChatStatusHook extends Hook {
  before(req: Request, res: Response, data: any): void {
    // logger.info("I was called before");
  }
  after(req: Request, res: Response, data: any): void {
    // logger.info("I was called after", data);
  }
}
export class List extends ChatStatusHook { }
export class View extends ChatStatusHook { }
export class Create extends ChatStatusHook { }
export class Update extends ChatStatusHook { }
export class Delete extends ChatStatusHook { }
export class Destroy extends ChatStatusHook { }
export class Restore extends ChatStatusHook { }
  