
import { Request, Response } from 'express';
import { Hook } from "../lib/hook-manager";
import logger from "../utils/logger";

class ChannelHook extends Hook {
  before(req: Request, res: Response, data: any): void {
    // logger.info("I was called before");
  }
  after(req: Request, res: Response, data: any): void {
    // logger.info("I was called after", data);
  }
}
export class List extends ChannelHook { }
export class View extends ChannelHook { }
export class Create extends ChannelHook { }
export class Update extends ChannelHook { }
export class Delete extends ChannelHook { }
export class Destroy extends ChannelHook { }
export class Restore extends ChannelHook { }
  