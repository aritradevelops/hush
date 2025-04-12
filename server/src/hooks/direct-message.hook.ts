
import { Request, Response } from 'express';
import { Hook } from "../lib/hook-manager";
import logger from "../utils/logger";

class DirectMessageHook extends Hook {
  before(req: Request, res: Response, data: any): void {
    // logger.info("I was called before");
  }
  after(req: Request, res: Response, data: any): void {
    // logger.info("I was called after", data);
  }
}
export class List extends DirectMessageHook { }
export class View extends DirectMessageHook { }
export class Create extends DirectMessageHook { }
export class Update extends DirectMessageHook { }
export class Delete extends DirectMessageHook { }
export class Destroy extends DirectMessageHook { }
export class Restore extends DirectMessageHook { }
  