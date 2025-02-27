
import secretRepository, { SecretRepository } from "../repositories/secret.repository";
import CrudService from "../utils/crud-service";

export class SecretService extends CrudService<SecretRepository> {
  constructor() {
    super(secretRepository);
  }
  async byRoomIdAndUser(roomId: string, userId: string) {
    return await this.repository.view({ room_id: roomId, user_id: userId })
  }
}
export default new SecretService();
