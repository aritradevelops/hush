import type { Server } from "socket.io";
import logger from "./utils/logger";
import chatRepository from "./repositories/chat.repository";
import { UUID } from "node:crypto";

interface Message {
  message: string;
  channel_id: UUID;
  from_id: string;
  iv: string;
}
export function registerSocketHandler(io: Server) {
  io.on("connection", (socket) => {
    logger.info('New user connected:', socket.id)


    socket.on('join', (channel_id: UUID) => {
      socket.join(channel_id)
    })


    socket.on("message", async (msg: Message) => {
      logger.info(`Message received: ${msg.message} from ${msg.from_id} in ${msg.channel_id}`)
      const chat = await chatRepository.create({
        created_at: new Date(),
        message: msg.message,
        channel_id: msg.channel_id,
        created_by: msg.from_id,
        iv: msg.iv,
        unread: true,
      })
      socket.broadcast.to(msg.channel_id).emit("private-message", msg, async () => {
        await chatRepository.update({ id: chat.raw.id }, { unread: false })
      });
    });


    socket.on("disconnect", () => {
      logger.info('User disconnected:', socket.id)
    });
  })
}