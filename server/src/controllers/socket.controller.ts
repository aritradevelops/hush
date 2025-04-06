import { UUID } from "crypto";
import Bind from "../decorators/bind";
import DirectMessage from "../entities/direct-message";
import { NotFoundError } from "../errors/http/not-found.error";
import db from "../lib/db";
import channelsQuery from "../queries/channels.query";
import chatRepository from "../repositories/chat.repository";
import contactRepository from "../repositories/contact.repository";
import directMessageRepository from "../repositories/direct-message.repository";
import userRepository from "../repositories/user.repository";
import type { AuthenticatedSocket } from "../socket-io";
import logger from "../utils/logger";
import { Server } from "socket.io";
import Group from "../entities/group";
import groupRepository from "../repositories/group.repository";
import groupMemberRepository from "../repositories/group-member.repository";

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
    const query = channelsQuery.getAllChannelIdsForUser()
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
    // add both of them to the new room
    socket.join(directMessage.id)
    if (this.activeConnections.has(data.contact_id)) {
      this.activeConnections.get(data.contact_id)!.join(directMessage.id)
    }
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
  private async onGroupCreate(socket: AuthenticatedSocket, data: { name: string, description?: string, member_ids: UUID[] }, callback: (group: Group) => void) {
    const insertResult = await groupRepository.create({
      ...data,
      member_ids: [...data.member_ids, socket.user.id],
      created_by: socket.user.id
    })
    const group = insertResult.raw[0]
    // create group members for all
    await Promise.all(group.member_ids.map((e: UUID) => groupMemberRepository.create({ user_id: e, created_by: socket.user.id, group_id: group.id })))
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