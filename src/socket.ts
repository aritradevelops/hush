import type { Server } from "socket.io";
import logger from "./utils/logger";
import chatRepository from "./repositories/chat.repository";

interface Message {
  message: string;
  room_id: string;
  from_id: string;
}
export function registerSocketHandler(io: Server) {
  io.on("connection", (socket) => {
    logger.info('New user connected:', socket.id)


    socket.on('join', (room_id: string) => {
      socket.join(room_id)
    })


    socket.on("message", async (msg: Message) => {
      logger.info(`Message received: ${msg.message} from ${msg.from_id} in ${msg.room_id}`)
      const chat = await chatRepository.create({
        created_at: new Date(),
        message: msg.message,
        room_id: msg.room_id,
        created_by: msg.from_id,
        unread: true,
      })
      socket.broadcast.to(msg.room_id).emit("private-message", msg, async () => {
        await chatRepository.update({ id: chat.raw.id }, { unread: false })
      });
    });


    socket.on("disconnect", () => {
      logger.info('User disconnected:', socket.id)
    });
  })
}