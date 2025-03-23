import { UUID } from "node:crypto";
import EventEmitter from "node:events";
import { Server as HttpServer } from "node:http";
import { Socket, Server as SocketIOServer } from "socket.io";
import { isAuthSocket } from "../middlewares/is-auth";
import logger from "../utils/logger";
import chatService from "../services/chat.service";
import { ChatEvents } from "../events/chat.events";
import env from "./env";

// Types
export interface AuthenticatedSocket extends Socket {
  user: {
    id: UUID;
  };
}

interface ChatMessage {
  message: string;
  channel_id: UUID;
  from_id: string;
  iv: string;
}

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

export interface ISocketManager {
  getClient(userId: UUID): AuthenticatedSocket | undefined;
  getAllClients(): AuthenticatedSocket[];
  emitToUser(userId: UUID, event: string, data: any): void;
  emitToAll(event: string, data: any): void;
  emitToRoom(room: string, event: string, data: any): void;
  registerHandler(event: string, handler: (socket: AuthenticatedSocket, data: any) => Promise<void>): void;
}

export class WebSocketManager extends EventEmitter implements ISocketManager {
  private io!: SocketIOServer;
  private connectedClients: Map<UUID, AuthenticatedSocket>;
  private eventHandlers: Map<string, (socket: AuthenticatedSocket, data: any) => Promise<void>>;
  private chatEvents: ChatEvents;

  constructor() {
    super();
    this.connectedClients = new Map();
    this.eventHandlers = new Map();
    this.chatEvents = new ChatEvents(this);
  }

  /**
   * Register an event handler
   */
  registerHandler(event: string, handler: (socket: AuthenticatedSocket, data: any) => Promise<void>): void {
    this.eventHandlers.set(event, handler);
  }

  /**
   * Initialize the WebSocket server with HTTP server
   */
  init(httpServer: HttpServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: env.get('CLIENT_URL'),
        credentials: true,
      },
      cookie: true
    });

    this.io.use(isAuthSocket);
    this.start();
  }

  /**
   * Start listening for WebSocket connections
   */
  private start(): void {
    this.io.on(SocketEvent.CONNECT, (socket: Socket) => {
      this.handleConnection(socket as AuthenticatedSocket);
    });
  }

  /**
   * Handle new client connections
   */
  private handleConnection(socket: AuthenticatedSocket): void {
    logger.info('New client connected:', socket.id);

    // Store client connection
    this.connectedClients.set(socket.user.id, socket);

    // Join personal room for direct notifications
    socket.join(socket.user.id);

    // Register event handlers
    this.eventHandlers.forEach((handler, event) => {
      socket.on(event, (data) => handler(socket, data));
    });

    // Handle disconnection
    socket.on(SocketEvent.DISCONNECT, () => {
      this.handleDisconnection(socket);
    });
  }

  /**
   * Handle client disconnections
   */
  private handleDisconnection(socket: AuthenticatedSocket): void {
    logger.info('Client disconnected:', socket.id);
    this.connectedClients.delete(socket.user.id);
  }

  /**
   * Get a connected client by user ID
   */
  getClient(userId: UUID): AuthenticatedSocket | undefined {
    return this.connectedClients.get(userId);
  }

  /**
   * Get all connected clients
   */
  getAllClients(): AuthenticatedSocket[] {
    return Array.from(this.connectedClients.values());
  }

  /**
   * Emit an event to a specific user
   */
  emitToUser(userId: UUID, event: string, data: any): void {
    const socket = this.getClient(userId);
    if (socket) {
      socket.emit(event, data);
    }
  }

  /**
   * Emit an event to all connected clients
   */
  emitToAll(event: string, data: any): void {
    this.io.emit(event, data);
  }

  /**
   * Emit an event to all clients in a room
   */
  emitToRoom(room: string, event: string, data: any): void {
    this.io.to(room).emit(event, data);
  }
}

export default new WebSocketManager();