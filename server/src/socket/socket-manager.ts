import { Socket } from "socket.io";
import { AuthenticatedSocket } from "../socket-io";


/**
 * Socket manager manages multiple connections from same user...
 */
export class SocketManager {
  // a map of active web socket connections to the server
  //! NOTE: ideally AuthenticatedSocket[] should be Set<AuthenticatedSocket>
  //? figure out if duplicate connections are there 
  //? then need to implement a object set to store multiple connections 
  private connections = new Map<string, AuthenticatedSocket[]>()

  add(socket: AuthenticatedSocket) {
    const userId = socket.user.id
    if (!this.connections.has(userId)) {
      this.connections.set(userId, [socket])
    } else {
      this.connections.get(userId)!.push(socket)
    }
  }

  getUserSockets(userId: string) {
    return this.connections.get(userId) || []
  }
  // for debugging purposes
  getUserSocketIds(userId: string) {
    return this.connections.get(userId)?.map(s => s.id).join(",") || "null"
  }

  remove(socket: AuthenticatedSocket) {
    const userId = socket.user.id
    if (!this.connections.has(userId)) return
    this.connections.set(userId, this.connections.get(userId)!.filter(s => s.id === socket.id))
  }

  toUser(userId: string, ...ev: Parameters<Socket["emit"]>) {
    if (!this.connections.has(userId)) return
    for (const s of this.connections.get(userId)!) {
      s.emit(...ev)
    }
  }
}