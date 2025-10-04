
import { UUID } from "crypto";
import { BadRequestError } from "../errors/http/bad-request.error";
import userRepository, { UserRepository } from "../repositories/user.repository";
import CrudService from "../utils/crud-service";
import { Request, Response } from "express";
import { IsNull } from "typeorm";
import contactService from "./contact.service";
import { ListParams } from "../schemas/list-params";
import { plainToInstance } from "class-transformer";
import mediaProviderFactory from "../providers/media";
import { MediaProvider } from "../providers/media/media.provider";
import path from "path";
import { InternalServerError } from "../errors/http/internal-server.error";

export class UserService extends CrudService<UserRepository> {
  private mediaProvider: MediaProvider;
  private directory: string = '/profile-pictures';

  constructor() {
    super(userRepository);
    this.mediaProvider = mediaProviderFactory.provider;
  }

  private getFullPath(id: UUID) {
    // using posix path join to enforce forward slashes in the path, which is required for URLs
    return path.posix.join(this.directory, id);
  }
  async listExcludingContacts(req: Request, res: Response) {
    const { search } = req.query
    if (!search || typeof search !== 'string') throw new BadRequestError()
    const result = await this.repository.listExcludingContacts(req.user!.id, search)
    return result;
  }
  async me(req: Request, res: Response) {
    const scopedFilter = this.getScopedFilter(req)
    const userId = req.user!.id
    const user = await this.repository.view({ id: userId, ...scopedFilter, deleted_at: IsNull() })
    if (!user) throw new BadRequestError()
    return user;
  }

  async uploadProfilePicture(req: Request, res: Response) {
    const userId = req.user!.id;
    const { mimetype } = req.query;

    if (!mimetype || typeof mimetype !== 'string') {
      throw new BadRequestError('Mimetype is required');
    }

    let extension: string;
    switch (mimetype) {
      case 'image/png':
        extension = '.png';
        break;
      case 'image/jpeg':
        extension = '.jpg';
        break;
      case 'image/gif':
        extension = '.gif';
        break;
      default:
        throw new BadRequestError('Unsupported mimetype');
    }

    const key = this.getFullPath(userId) + extension;
    const url = await this.mediaProvider.getUrl(key);
    const result = await this.mediaProvider.upload(key, req.body);
    if (!result) throw new InternalServerError();

    await this.repository.update({ id: userId }, { dp: url });

    return await this.repository.view({ id: userId });
  }
}
export default new UserService();
