
import { Request, Response } from 'express';
import { Hook } from "../lib/hook-manager";
import logger from "../utils/logger";

class SecretHook extends Hook {
  before(req: Request, res: Response, data: any): void {
    // logger.info("I was called before");
  }
  after(req: Request, res: Response, data: any): void {
    // logger.info("I was called after", data);
  }
}
export class List extends SecretHook { }
export class View extends SecretHook { }
export class Create extends SecretHook { }
export class Update extends SecretHook { }
export class Delete extends SecretHook { }
export class Destroy extends SecretHook { }
export class Restore extends SecretHook { }
  