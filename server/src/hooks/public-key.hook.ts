
import { Request, Response } from 'express';
import { Hook } from "../lib/hook-manager";
import logger from "../utils/logger";

class PublicKeyHook extends Hook {
  before(req: Request, res: Response, data: any): void {
    // logger.info("I was called before");
  }
  after(req: Request, res: Response, data: any): void {
    // logger.info("I was called after", data);
  }
}
export class List extends PublicKeyHook { }
export class View extends PublicKeyHook { }
export class Create extends PublicKeyHook { }
export class Update extends PublicKeyHook { }
export class Delete extends PublicKeyHook { }
export class Destroy extends PublicKeyHook { }
export class Restore extends PublicKeyHook { }
  