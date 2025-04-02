import { UUID } from "crypto";
import type { AuthenticatedSocket } from "../socket-io";
import Bind from "../decorators/bind";
import logger from "../utils/logger";
import directMessageRepository from "../repositories/direct-message.repository";
import contactRepository from "../repositories/contact.repository";
import userRepository from "../repositories/user.repository";
import { NotFoundError } from "../errors/http/not-found.error";
import DirectMessage from "../entities/direct-message";
import chatRepository from "../repositories/chat.repository";
import { plainToClass, plainToInstance } from "class-transformer";
import { ListParams } from "../schemas/list-params";
import db from "../lib/db";
import channelsQuery from "../queries/channels.query";

// TODO: figure out a way to validate client sent data
export class SocketController {
  private activeConnections: Map<UUID, AuthenticatedSocket> = new Map();
  public handleConnection(socket: AuthenticatedSocket) {
    socket.on(SocketEvent.CONNECT, this.onConnect)
    socket.on(SocketEvent.CONTACT_ADD, (data, callback) => {
      this.onContactAdd(socket, data, callback)
    })
    socket.on(SocketEvent.MESSAGE_SEND, (data) => {
      this.onMessageSend(socket, data)
    })


    socket.on('disconnect', (r) => this.onDisconnect(r, socket))
  }
  @Bind
  private async onConnect(socket: AuthenticatedSocket) {
    logger.info(`User connected: ${socket.user.id}`)
    this.activeConnections.set(socket.user.id, socket)
    const query = channelsQuery.getAllChannelIdsForUser()
    const result = await db.getManager().query(query, [socket.user.id])
    for (const channel of result) {
      socket.join(channel.id)
    }
  }
  @Bind
  private onDisconnect(reason: string, socket: AuthenticatedSocket) {
    logger.notice(`socket connection closed: ${reason}`)
    logger.info(`User disconnected: ${socket.user.id}`)
    this.activeConnections.delete(socket.user.id)
  }
  @Bind
  private async onContactAdd(socket: AuthenticatedSocket, data: { contact_id: UUID }, callback: (dm: DirectMessage) => void) {
    // find existing direct message or create new one
    // const directMessage = await directMessageRepository.findOrCreate(socket.user.id, data.contact_id)
    let directMessage = await directMessageRepository.findByMemberIds(socket.user.id, data.contact_id)
    if (!directMessage) {
      const insertResult = await directMessageRepository.create({
        member_ids: [socket.user.id, data.contact_id],
        created_by: socket.user.id
      })
      directMessage = insertResult.raw[0]
    }
    const user = await userRepository.view({ id: data.contact_id })
    if (!user) throw new NotFoundError()
    // create new contact
    await contactRepository.create({
      name: user.name,
      channel_id: directMessage.id,
      user_id: data.contact_id,
      created_by: socket.user.id
    })
    callback(directMessage)
  }
  @Bind
  private async onMessageSend(socket: AuthenticatedSocket, data: { channel_id: UUID, encrypted_message: string, iv: string }) {
    const insertResult = await chatRepository.create({
      channel_id: data.channel_id,
      message: data.encrypted_message,
      iv: data.iv,
      created_by: socket.user.id
    })
    socket.except(socket.id).to(data.channel_id).emit(SocketEvent.MESSAGE_SEND, insertResult.raw[0])
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