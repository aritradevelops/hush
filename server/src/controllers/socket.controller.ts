import { UUID } from "crypto";
import { Server } from "socket.io";
import Bind from "../decorators/bind";
import Channel, { ChannelType } from "../entities/channel";
import { NotFoundError } from "../errors/http/not-found.error";
import db from "../lib/db";
import channelsQuery from "../queries/channel.query";
import channelParticipantRepository from "../repositories/channel-participant.repository";
import channelRepository from "../repositories/channel.repository";
import chatRepository from "../repositories/chat.repository";
import userRepository from "../repositories/user.repository";
import type { AuthenticatedSocket } from "../socket-io";
import logger from "../utils/logger";
import contactRepository from "../repositories/contact.repository";

// TODO: figure out a way to validate client sent data
export class SocketController {
  private activeConnections: Map<UUID, AuthenticatedSocket> = new Map();
  private io!: Server
  init(io: Server) {
    this.io = io
  }
  public handleConnection(socket: AuthenticatedSocket) {
    this.onConnect(socket);
    socket.on(SocketClientEmittedEvents.CONTACT_ADD, (data, callback) => {
      this.onContactAdd(socket, data, callback)
    })
    socket.on(SocketClientEmittedEvents.MESSAGE_SEND, (data) => {
      this.onMessageSend(socket, data)
    })

    socket.on(SocketClientEmittedEvents.TYPING_START, (data) => {
      console.log(socket.user.id + ' started typing on channel :' + data.channel_id)
      this.onTypingStart(socket, data)
    })
    socket.on(SocketClientEmittedEvents.TYPING_STOP, (data) => {
      console.log(socket.user.id + ' stopped typing on channel :' + data.channel_id)
      this.onTypingStop(socket, data)
    })
    socket.on(SocketClientEmittedEvents.GROUP_CREATE, (data, callback) => {
      this.onGroupCreate(socket, data, callback)
    })
    socket.on('disconnect', (r) => this.onDisconnect(r, socket))
  }
  @Bind
  private async onConnect(socket: AuthenticatedSocket) {
    logger.info(`User connected: ${socket.user.id}`)
    this.activeConnections.set(socket.user.id, socket)
    const query = channelsQuery.getAllValidChannelIdsForUser()
    const result = await db.getManager().query(query, [socket.user.id])
    for (const channel of result) {
      logger.info(`${socket.user.id} is joining ${channel.id}`)
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
  private async onContactAdd(socket: AuthenticatedSocket, data: { contact_id: UUID }, callback: (dm: Channel) => void) {
    const user = await userRepository.view({ id: data.contact_id })
    if (!user) throw new NotFoundError()
    // find existing direct channel or create new one
    let directChannel = await channelRepository.getDmByMemberIds(socket.user.id, data.contact_id)
    if (!directChannel) {
      const insertResult = await channelRepository.create({ type: ChannelType.DM, created_by: socket.user.id })
      directChannel = insertResult.raw[0] as Channel
      await Promise.all([socket.user.id, user.id].map(e =>
        channelParticipantRepository.create({
          channel_id: directChannel!.id,
          user_id: e,
          created_by: socket.user.id
        })))
    }
    // create new contact
    await contactRepository.create({
      nickname: user.name,
      user_id: user.id,
      created_by: socket.user.id
    })
    // add both of them to the new room
    socket.join(directChannel.id)
    if (this.activeConnections.has(user.id)) {
      this.activeConnections.get(user.id)!.join(directChannel.id)
    }
    callback(directChannel)
  }
  @Bind
  private async onMessageSend(socket: AuthenticatedSocket, data: { channel_id: UUID, encrypted_message: string, iv: string }) {
    const insertResult = await chatRepository.create({
      channel_id: data.channel_id,
      encrypted_message: data.encrypted_message,
      iv: data.iv,
      created_by: socket.user.id
    })
    this.io.to(data.channel_id).emit(SocketServerEmittedEvents.MESSAGE_RECEIVED, insertResult.raw[0])
  }
  @Bind
  private async onTypingStart(socket: AuthenticatedSocket, { channel_id }: { channel_id: UUID }) {
    socket.to(channel_id).emit(SocketServerEmittedEvents.TYPING_START, { channel_id, user_id: socket.user.id })
  }
  @Bind
  private async onTypingStop(socket: AuthenticatedSocket, { channel_id }: { channel_id: UUID }) {
    socket.to(channel_id).emit(SocketServerEmittedEvents.TYPING_STOP, { channel_id, user_id: socket.user.id })
  }
  @Bind
  private async onGroupCreate(socket: AuthenticatedSocket, data: { name: string, description?: string, member_ids: UUID[] }, callback: (group: Channel) => void) {
    const insertResult = await channelRepository.create({
      type: ChannelType.GROUP,
      metadata: { name: data.name, description: data.description },
      created_by: socket.user.id
    })
    const group = insertResult.raw[0]
    data.member_ids.push(socket.user.id)
    // create group members for all
    await Promise.all(data.member_ids.map((e: UUID) => channelParticipantRepository.create({ user_id: e, created_by: socket.user.id, channel_id: group.id })))
    callback(insertResult.raw[0])
  }
}

export default new SocketController();

// Socket Event Names
export enum SocketClientEmittedEvents {
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
export enum SocketServerEmittedEvents {
  MESSAGE_RECEIVED = 'message:received',
  // Typing Events
  TYPING_START = 'typing:start',
  TYPING_STOP = 'typing:stop',
}