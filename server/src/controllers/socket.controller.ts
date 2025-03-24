import { UUID } from "crypto";
import type { AuthenticatedSocket } from "../socket-io";
import Bind from "../decorators/bind";
import logger from "../utils/logger";


export class SocketController {
  private activeConnections: Map<UUID, AuthenticatedSocket> = new Map();
  public handleConnection(socket: AuthenticatedSocket) {
    socket.on(SocketEvent.CONNECT, this.onConnect)





    socket.on('disconnect', (r) => this.onDisconnect(r, socket))
  }
  @Bind
  private onConnect(socket: AuthenticatedSocket) {
    logger.info(`User connected: ${socket.user.id}`)
    this.activeConnections.set(socket.user.id, socket)
  }
  @Bind
  private onDisconnect(reason: string, socket: AuthenticatedSocket) {
    logger.notice(`socket connection closed: ${reason}`)
    logger.info(`User disconnected: ${socket.user.id}`)
    this.activeConnections.delete(socket.user.id)
  }
}

export default new SocketController();

// Socket Event Names
export enum SocketEvent {
  // Connection Events
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',

  // Contact Events
  CONTACT_ADD = 'contact:add',
  CONTACT_BLOCK = 'contact:block',
  CONTACT_UNBLOCK = 'contact:unblock',

  // Channel Events
  CHANNEL_MUTE = 'channel:mute',
  CHANNEL_NEW = 'channel:new',
  CHANNEL_PIN = 'channel:pin',
  CHANNEL_UNMUTE = 'channel:unmute',
  CHANNEL_UNPIN = 'channel:unpin',

  // Group Events
  GROUP_CREATE = 'group:create',
  GROUP_DELETE = 'group:delete',
  GROUP_JOIN = 'group:join',
  GROUP_LEAVE = 'group:leave',
  GROUP_MUTE = 'group:mute',
  GROUP_PIN = 'group:pin',
  GROUP_UNMUTE = 'group:unmute',
  GROUP_UNPIN = 'group:unpin',
  GROUP_UPDATE = 'group:update',

  // Message Events
  MESSAGE_PIN = 'message:pin',
  MESSAGE_READ = 'message:read',
  MESSAGE_SEND = 'message:send',
  MESSAGE_UNPIN = 'message:unpin',

  // Typing Events
  TYPING_START = 'typing:start',
  TYPING_STOP = 'typing:stop',
}