import { UUID } from "crypto";
import { Server } from "socket.io";
import { In, IsNull } from "typeorm";
import Bind from "../decorators/bind";
import Channel, { ChannelType } from "../entities/channel";
import Chat from "../entities/chat";
import UserChatInteraction, { UserChatInteractionStatus } from "../entities/user-chat-interaction";
import { NotFoundError } from "../errors/http/not-found.error";
import db from "../lib/db";
import channelsQuery from "../queries/channel.query";
import channelParticipantRepository from "../repositories/channel-participant.repository";
import channelRepository from "../repositories/channel.repository";
import chatRepository from "../repositories/chat.repository";
import contactRepository from "../repositories/contact.repository";
import userChatInteractionRepository from "../repositories/user-chat-interaction.repository";
import userRepository from "../repositories/user.repository";
import type { AuthenticatedSocket } from "../socket-io";
import logger from "../utils/logger";
import ChannelParticipant from "../entities/channel-participant";
import { v4 } from "uuid";

// TODO: figure out a way to validate client sent data
export class SocketController {
  // TODO: one user might be connected to multiple devices, so we need to make it map<UUID, Set<AuthenticatedSocket>>
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
    socket.on(SocketClientEmittedEvents.CHANNEL_SEEN, (data) => {
      this.onChannelSeen(socket, data)
    })

    // socket.on(SocketClientEmittedEvents.MESSAGE_SEEN, (data) => {
    //   this.onMessageSeen(socket, data)
    // })

    // socket.on(SocketClientEmittedEvents.MESSAGE_RECIEVED, (data) => {
    //   this.onMessageRecieved(socket, data)
    // })

    socket.on('disconnect', (r) => this.onDisconnect(r, socket))
  }
  @Bind
  private async onConnect(socket: AuthenticatedSocket) {
    logger.info(`User connected: ${socket.user.id}`)
    this.activeConnections.set(socket.user.id, socket)
    // set all the messages pending messages as delivered
    const pendingMessages = await userChatInteractionRepository.getPendingInteractions(socket.user.id)
    if (pendingMessages.length) {
      const { affected } = await userChatInteractionRepository.update({ id: In(pendingMessages.map(e => e.id)) }, { status: UserChatInteractionStatus.RECEIVED })
      logger.info(`Updated ${affected} messages as delivered`)
      // notify the sender that the message has been delivered
      for (const m of pendingMessages) {
        logger.info(`Notifying user ${m.chat.created_by} that message ${m.chat.id} has been delivered`, this.activeConnections.get(m.chat.created_by)?.id || "null")

        this.activeConnections.get(m.chat.created_by)?.emit(SocketServerEmittedEvents.MESSAGE_DELIVERED, { chat_id: m.chat.id, channel_id: m.channel_id, status: UserChatInteractionStatus.RECEIVED, updated_at: new Date(), updated_by: socket.user.id })
      }
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
  private async onMessageSend(socket: AuthenticatedSocket, data: { id: UUID, channel_id: UUID, encrypted_message: string, iv: string, created_at: string }) {
    const insertResult = await chatRepository.create({
      id: data.id,
      channel_id: data.channel_id,
      encrypted_message: data.encrypted_message,
      iv: data.iv,
      created_at: new Date(data.created_at),
      created_by: socket.user.id
    })
    const participants = await channelParticipantRepository.getByChannelId(data.channel_id)
    const participantUciMap = new Map<UUID, Partial<UserChatInteraction>>()
    await userChatInteractionRepository.create(participants.map((p) => {
      const uci = {
        id: v4() as UUID,
        channel_id: data.channel_id,
        chat_id: insertResult.raw[0].id,
        created_by: p.user_id,
        status: p.id === socket.user.id ? UserChatInteractionStatus.SEEN : UserChatInteractionStatus.NO_INTERACTION,
        deleted_at: null
      }
      participantUciMap.set(p.user_id, uci)
      return uci
    }))
    for (const p of participants) {
      // if the intended recipient is active then notify them about the message
      // and they will notify about whether they have seen the message or not
      this.activeConnections.get(p.user_id)?.emit(SocketServerEmittedEvents.MESSAGE_RECEIVED, { ...insertResult.raw[0], ucis: Array.from(participantUciMap.values()).filter(uci => uci.created_by !== p.user_id) }, async ({ status }: { status: UserChatInteractionStatus }) => {
        logger.info(`User ${p.user_id} has ${status} the message`)
        await userChatInteractionRepository.update({ id: participantUciMap.get(p.user_id)!.id }, { status: Number(status), updated_at: new Date(), updated_by: p.user_id })
        // notify others that the user has recieved or seen the message
        participants.filter(cp => cp.user_id !== p.user_id).forEach((cp) => {
          // TODO: make this single event
          this.activeConnections.get(cp.user_id)?.emit(Number(status) === UserChatInteractionStatus.RECEIVED ? SocketServerEmittedEvents.MESSAGE_DELIVERED : SocketServerEmittedEvents.MESSAGE_SEEN, { ...participantUciMap.get(p.user_id), status: String(status), updated_at: new Date(), updated_by: p.user_id })
        })
      })
    }
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

  @Bind
  private async onChannelSeen(socket: AuthenticatedSocket, data: { channel_id: UUID }) {
    const notSeenChats = await userChatInteractionRepository.getNotSeenInteractions(socket.user.id, data.channel_id)
    // set all the messages as seen
    if (notSeenChats.length) {
      const { affected } = await userChatInteractionRepository.update({ id: In(notSeenChats.map(e => e.id)) }, { status: UserChatInteractionStatus.SEEN })
      logger.info(`Updated ${affected} messages as seen`)
      // notify the sender that the message has been seen
      for (const m of notSeenChats) {
        logger.info(`chat`, m)
        logger.info(`Notifying user ${m.chat.created_by} that message ${m.chat.id} has been seen`, this.activeConnections.get(m.chat.created_by)?.id || "null")
        this.activeConnections.get(m.chat.created_by)?.emit(SocketServerEmittedEvents.MESSAGE_SEEN, { chat_id: m.chat.id, channel_id: m.channel_id, status: UserChatInteractionStatus.SEEN, updated_at: new Date(), updated_by: socket.user.id })
      }
    }
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
  CHANNEL_SEEN = 'channel:seen',

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
  MESSAGE_SEEN = 'message:seen',
  MESSAGE_RECIEVED = 'message:recieved',
  MESSAGE_SEND = 'message:send',
  MESSAGE_UNPIN = 'message:unpin',

  // Typing Events
  TYPING_START = 'typing:start',
  TYPING_STOP = 'typing:stop',
}
export enum SocketServerEmittedEvents {
  MESSAGE_RECEIVED = 'message:received',
  MESSAGE_DELIVERED = 'message:delivered',
  MESSAGE_SEEN = 'message:seen',
  // Typing Events
  TYPING_START = 'typing:start',
  TYPING_STOP = 'typing:stop',
}