
import { Request, Response } from 'express';
import { Hook } from "../lib/hook-manager";
import logger from "../utils/logger";

class ContactHook extends Hook {
  before(req: Request, res: Response, data: any): void {
    // logger.info("I was called before");
  }
  after(req: Request, res: Response, data: any): void {
    // logger.info("I was called after", data);
  }
}
export class List extends ContactHook { }
export class View extends ContactHook { }
export class Create extends ContactHook { }
export class Update extends ContactHook { }
export class Delete extends ContactHook { }
export class Destroy extends ContactHook { }
export class Restore extends ContactHook { }
  