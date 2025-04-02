import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import socketController from "./controllers/socket.controller";
import { isAuthSocket } from "./middlewares/is-auth";
import { UUID } from "crypto";
import { Socket } from "socket.io";
import logger from "./utils/logger";
import env from "./lib/env";
export class SocketIO {
  private io!: Server;

  init(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: env.get('CLIENT_URL'),
        credentials: true,
      },
    })
    this.io.use(isAuthSocket)
    this.io.on('connection', socket => {
      const authenticateSocket = socket as AuthenticatedSocket
      socketController.handleConnection(authenticateSocket)
    })
    logger.info('SocketIO initialized')
  }
}
export default new SocketIO()

export interface AuthenticatedSocket extends Socket {
  user: {
    id: UUID;
  };
}
