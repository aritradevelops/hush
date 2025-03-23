import { UUID } from "crypto";
import { SocketEvent, type AuthenticatedSocket, type ISocketManager } from "../lib/web-socket-manager";
import chatRepository from "../repositories/chat.repository";

export interface MessageSendPayload {
  channel_id: UUID;
  message: string;
  iv: string;
}

export class ChatEvents {
  constructor(private socketManager: ISocketManager) { }

  /**
   * Register all chat event handlers
   */
  registerHandlers(): void {
    this.socketManager.registerHandler(SocketEvent.MESSAGE_SEND, this.onMessageSend.bind(this));
  }

  /**
   * Handle message send event
   */
  private async onMessageSend(socket: AuthenticatedSocket, payload: MessageSendPayload): Promise<void> {
    const { channel_id, message, iv } = payload;
    const userId = socket.user.id;

    const chat = await chatRepository.create({
      channel_id,
      created_by: userId,
      message,
      iv,
    });

    this.socketManager.emitToRoom(channel_id, SocketEvent.MESSAGE_SEND, chat);
  }
}