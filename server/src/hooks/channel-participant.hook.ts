
import { Request, Response } from 'express';
import { Hook } from "../lib/hook-manager";
import logger from "../utils/logger";

class ChannelParticipantHook extends Hook {
  before(req: Request, res: Response, data: any): void {
    // logger.info("I was called before");
  }
  after(req: Request, res: Response, data: any): void {
    // logger.info("I was called after", data);
  }
}
export class List extends ChannelParticipantHook { }
export class View extends ChannelParticipantHook { }
export class Create extends ChannelParticipantHook { }
export class Update extends ChannelParticipantHook { }
export class Delete extends ChannelParticipantHook { }
export class Destroy extends ChannelParticipantHook { }
export class Restore extends ChannelParticipantHook { }
  