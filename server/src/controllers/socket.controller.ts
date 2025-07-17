import { UUID } from "crypto";
import { Server } from "socket.io";
import { In, IsNull } from "typeorm";
import { v4 } from "uuid";
import Bind from "../decorators/bind";
import Call from "../entities/call";
import Channel, { ChannelType } from "../entities/channel";
import ChatMedia from "../entities/chat-media";
import UserChatInteraction, { UserChatInteractionStatus, UserChatInteractionStatusEnum } from "../entities/user-chat-interaction";
import { NotFoundError } from "../errors/http/not-found.error";
import callRepository from "../repositories/call.repository";
import channelParticipantRepository from "../repositories/channel-participant.repository";
import channelRepository from "../repositories/channel.repository";
import chatRepository from "../repositories/chat.repository";
import contactRepository from "../repositories/contact.repository";
import userChatInteractionRepository from "../repositories/user-chat-interaction.repository";
import userRepository from "../repositories/user.repository";
import type { AuthenticatedSocket } from "../socket-io";
import logger from "../utils/logger";

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

    socket.on(SocketClientEmittedEvents.CALL_JOIN, (data) => {
      this.onCallJoin(socket, data)
    })
    socket.on(SocketClientEmittedEvents.CALL_LEAVE, (data) => {
      this.onCallLeave(socket, data)
    })
    socket.on(SocketClientEmittedEvents.CALL_START, (data, callback) => {
      this.onCallStart(socket, data, callback)
    })

    socket.on(SocketClientEmittedEvents.RTC_SESSCION_DESCRIPTION, (data) => {
      this.onRTCSessionDescription(socket, data)
    })
    socket.on(SocketClientEmittedEvents.RTC_ICE_CANDIDATE, (data) => {
      this.onRTCICECandidate(socket, data)
    })

    socket.on('disconnect', (r) => this.onDisconnect(r, socket))
  }
  @Bind
  private async onConnect(socket: AuthenticatedSocket) {
    logger.info(`User connected: ${socket.user.id}`)
    this.activeConnections.set(socket.user.id, socket)
    // set all the messages pending messages as delivered
    const pendingMessages = await userChatInteractionRepository.getPendingInteractions(socket.user.id)
    if (pendingMessages.length) {
      const { affected } = await userChatInteractionRepository.update({
        id: In(pendingMessages.map(e => e.id))
      }, {
        status: UserChatInteractionStatusEnum.RECEIVED
      })
      logger.info(`Updated ${affected} messages as delivered`)
      // notify the sender that the message has been delivered
      for (const m of pendingMessages) {
        logger.info(`Notifying user ${m.chat.created_by} that message ${m.chat.id} has been delivered`,
          this.activeConnections.get(m.chat.created_by)?.id || "null")

        this.activeConnections.get(m.chat.created_by)?.emit(SocketServerEmittedEvents.MESSAGE_DELIVERED,
          {
            chat_id: m.chat.id, channel_id: m.channel_id, status: UserChatInteractionStatusEnum.RECEIVED,
            updated_at: new Date(), updated_by: socket.user.id
          })
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
    callback(directChannel)
  }
  @Bind
  private async onMessageSend(socket: AuthenticatedSocket, data:
    { id: UUID, channel_id: UUID, encrypted_message: string, iv: string, created_at: string, attachments: ChatMedia[] }) {
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
        status: p.user_id === socket.user.id ? UserChatInteractionStatusEnum.SEEN : UserChatInteractionStatusEnum.NO_INTERACTION,
        deleted_at: null
      }
      participantUciMap.set(p.user_id, uci)
      return uci
    }))
    for (const p of participants) {
      // if the intended recipient is active then notify them about the message
      // and they will notify about whether they have seen the message or not
      this.activeConnections.get(p.user_id)?.emit(SocketServerEmittedEvents.MESSAGE_RECEIVED,
        {
          ...insertResult.raw[0], ucis: Array.from(participantUciMap.values()).
            filter(uci => uci.created_by !== p.user_id), attachments: data.attachments
        }, async ({ status, event }:
          { status: UserChatInteractionStatus, event: string }) => {
        logger.info(`User ${p.user_id} has ${event}:${status} the message`)
        await userChatInteractionRepository.update({ id: participantUciMap.get(p.user_id)!.id },
          { status: status, updated_at: new Date(), updated_by: p.user_id })
        // notify others that the user has recieved or seen the message
        participants.filter(cp => cp.user_id !== p.user_id).forEach((cp) => {
          // TODO: make this single event
          this.activeConnections.get(cp.user_id)?.emit(status === UserChatInteractionStatusEnum.RECEIVED
            ? SocketServerEmittedEvents.MESSAGE_DELIVERED : SocketServerEmittedEvents.MESSAGE_SEEN,
            { ...participantUciMap.get(p.user_id), status: status, updated_at: new Date(), updated_by: p.user_id })
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
  private async onGroupCreate(socket: AuthenticatedSocket, data:
    { name: string, description?: string, member_ids: UUID[] },
    callback: (group: Channel) => void) {
    const insertResult = await channelRepository.create({
      type: ChannelType.GROUP,
      metadata: { name: data.name, description: data.description },
      created_by: socket.user.id
    })
    const group = insertResult.raw[0]
    data.member_ids.push(socket.user.id)
    // create group members for all
    await Promise.all(data.member_ids.map((e: UUID) => channelParticipantRepository.create(
      { user_id: e, created_by: socket.user.id, channel_id: group.id })))
    callback(insertResult.raw[0])
  }

  @Bind
  private async onChannelSeen(socket: AuthenticatedSocket, data: { channel_id: UUID }) {
    console.log('received channel seen', data.channel_id)
    const notSeenChats = await userChatInteractionRepository.getNotSeenInteractions(socket.user.id, data.channel_id)
    // set all the messages as seen
    if (notSeenChats.length) {
      const { affected } = await userChatInteractionRepository.update({ id: In(notSeenChats.map(e => e.id)) },
        { status: UserChatInteractionStatusEnum.SEEN })
      logger.info(`Updated ${affected} messages as seen`)
      // notify the sender that the message has been seen
      for (const m of notSeenChats) {
        logger.info(`chat`, m)
        logger.info(`Notifying user ${m.chat.created_by} that message ${m.chat.id} has been seen`,
          this.activeConnections.get(m.chat.created_by)?.id || "null")
        this.activeConnections.get(m.chat.created_by)?.emit(SocketServerEmittedEvents.MESSAGE_SEEN,
          {
            chat_id: m.chat.id, channel_id: m.channel_id, status: UserChatInteractionStatusEnum.SEEN,
            updated_at: new Date(), updated_by: socket.user.id
          })
      }
    }
  }

  @Bind private async onCallJoin(socket: AuthenticatedSocket, data: Call) {
    const cp = await channelParticipantRepository.view({ user_id: socket.user.id, deleted_at: IsNull() })
    if (!cp) {
      logger.notice(`Non member user (${socket.user.id}) tried to join call ${data.id}`)
      return
    }
    socket.join(data.id)
    logger.info(`new user ${socket.user.id} joined the call ${data.id}`)
    const socketsInRoom = await this.io.in(data.id).fetchSockets()
    const existingUsers = socketsInRoom
      .filter((s) => (s as unknown as AuthenticatedSocket).user.id !== socket.user.id)
      .map((s) => (s as unknown as AuthenticatedSocket).user.id)
    logger.info('existing users', existingUsers, 'socket user', socket.user.id)
    // Notify others about the new user (they'll create impolite peer connections)
    socket.to(data.id).emit(SocketServerEmittedEvents.CALL_JOINED, { id: socket.user.id, polite: false })
    // Notify new user about existing participants (it will create polite connections)
    socket.emit(SocketServerEmittedEvents.CALL_JOINED, {
      existing_users: [...new Set(existingUsers)],
      polite: true
    })
  }
  @Bind private async onCallLeave(socket: AuthenticatedSocket, data: Call) {
    logger.info(`user ${socket.user.id} left the call ${data.id}`)
    socket.leave(data.id)
    const existingUsers = await this.io.in(data.id).fetchSockets()
    if (![...new Set(existingUsers)].length) {
      await callRepository.update({ id: data.id }, { ended_at: new Date() })
      // There's no more member on this call so end the call
      const members = await channelParticipantRepository.getByChannelId(data.channel_id)
      for (const member of members) {
        this.activeConnections.get(member.user_id)?.emit(SocketServerEmittedEvents.CALL_ENDED, data)
      }
    } else {
      // Notify others that user has left the call
      socket.to(data.id).emit(SocketServerEmittedEvents.CALL_LEFT, { ...data, from: socket.user.id })
    }

  }

  @Bind
  private async onRTCSessionDescription(socket: AuthenticatedSocket, data: { descripion: any, to: UUID }) {
    this.activeConnections.get(data.to)?.emit(SocketServerEmittedEvents.RTC_SESSION_DESCRIPTION, {
      ...data,
      from: socket.user.id
    })
  }
  @Bind
  private async onRTCICECandidate(socket: AuthenticatedSocket, data: { candidate: any, to: UUID }) {
    this.activeConnections.get(data.to)?.emit(SocketServerEmittedEvents.RTC_ICE_CANDIDATE, {
      ...data,
      from: socket.user.id
    })
  }

  @Bind
  private async onCallStart(socket: AuthenticatedSocket, data: Pick<Call, 'channel_id' | 'channel_type' | 'iv'>, cb: (call: Call | string) => void) {
    try {
      // check if there's already an call running for this channel
      const callExisting = await callRepository.view({ channel_id: data.channel_id, channel_type: data.channel_type, ended_at: IsNull() })
      if (callExisting) {
        return cb("call is running")
      }
      const result = await callRepository.create({ ...data, created_by: socket.user.id })
      const newCall = result.raw[0] as Call
      // create a new room for this call
      socket.join(newCall.id)

      // let user know about the call
      cb(newCall)
      // Notify channel members
      const cps = await channelParticipantRepository.getByChannelId(data.channel_id)
      cps.forEach(cp => {
        this.activeConnections.get(cp.user_id)?.emit(SocketServerEmittedEvents.CALL_STARTED, newCall)
      })
    } catch (error) {
      logger.notice("failed to create call")
      logger.error(error)
      cb((error as Error).message)
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

  CALL_JOIN = "call:join",
  CALL_LEAVE = "call:leave",
  CALL_START = 'call:start',

  RTC_SESSCION_DESCRIPTION = "rtc:sessiondescription",
  RTC_ICE_CANDIDATE = "rtc:icecandiate",
}
export enum SocketServerEmittedEvents {
  MESSAGE_RECEIVED = 'message:received',
  MESSAGE_DELIVERED = 'message:delivered',
  MESSAGE_SEEN = 'message:seen',
  // Typing Events
  TYPING_START = 'typing:start',
  TYPING_STOP = 'typing:stop',

  CALL_JOINED = 'call:joined',
  CALL_LEFT = 'call:left',
  CALL_STARTED = 'call:started',
  CALL_ENDED = 'call:ended',

  RTC_SESSION_DESCRIPTION = "rtc:sessiondescription",
  RTC_ICE_CANDIDATE = "rtc:icecandiate",
}