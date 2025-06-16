
import { MediaProvider } from "../providers/media/media.provider";
import chatMediaRepository, { ChatMediaRepository } from "../repositories/chat-media.repository";
import CrudService from "../utils/crud-service";
import mediaProviderFactory from '../providers/media/index'
import { Request, Response } from 'express'
import { UnauthenticatedError } from "../errors/http/unauthenticated.error";
import ChatMedia, { ChatMediaStatusEnum } from "../entities/chat-media";
import path from 'path'
import { MultipartEnd, PartUpload } from "../schemas/media";
import { InternalServerError } from "../errors/http/internal-server.error";
import * as uuid from 'uuid'
import { UUID } from "crypto";
// TODO: store url
export class ChatMediaService extends CrudService<ChatMediaRepository> {
  private mediaProvider: MediaProvider
  private directory: string = '/chat-medias'
  constructor() {
    super(chatMediaRepository);
    this.mediaProvider = mediaProviderFactory.provider
  }
  private getFullPath(data: ChatMedia) {
    return path.join(this.directory, data.channel_id, data.id)
  }
  async multipartInit(req: Request, res: Response, data: ChatMedia) {
    // initialize new id and cloud_storage_url
    data.id = uuid.v4() as UUID
    data.cloud_storage_url = this.getFullPath(data)
    const response: ChatMedia = await super.create(req, res, data)
    const key = this.getFullPath(response)
    await this.repository.update({ id: response.id }, { cloud_storage_url: await this.mediaProvider.getUrl(key) })
    const result = await this.mediaProvider.multipartInit(key)
    return { ...response, multipart_id: result.id, path: key }
  }
  async partUpload(req: Request, res: Response, data: PartUpload) {
    const response = await this.mediaProvider.partUpload(data.path, data.multipart_id, data.part_number, req.body)
    if (!response) throw new InternalServerError()
    return response
  }
  async multipartEnd(req: Request, res: Response, data: MultipartEnd) {
    const result = await this.mediaProvider.multipartEnd(data.path, data.multipart_id)
    if (!result) throw new InternalServerError()
    await this.repository.update({ id: data.id }, { status: ChatMediaStatusEnum.UPLOADED })
  }
}
export default new ChatMediaService();
