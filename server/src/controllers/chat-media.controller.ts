
import { singularize } from "inflection";
import { POST, PUT } from "../decorators/method";
import ChatMedia from "../entities/chat-media";
import chatMediaService, { ChatMediaService } from "../services/chat-media.service";
import CrudController from "../utils/crud-controller";
import { Request, Response } from "express";
import { kebabToPascal } from "../utils/string";
import { plainToInstance } from "class-transformer";
import { MultipartEnd, PartUpload } from "../schemas/media";
import { validateOrReject } from "class-validator-custom-errors";
import uuid from 'uuid'
import { UUID } from "crypto";
import { PassThrough } from "stream";
import fs from 'fs'

export class ChatMediaController extends CrudController<typeof ChatMedia, ChatMediaService> {
  constructor() {
    super(chatMediaService, ChatMedia);
  }
  @POST()
  async multipartInit(req: Request, res: Response) {
    const sanitized = await this._validate(req.body, req.t);
    const data = await this.service.multipartInit(req, res, sanitized);
    res.status(201);
    return {
      message: req.t('controller.create', { module: singularize(kebabToPascal(req.params.module as string)) }),
      data: data
    };
  }

  @PUT()
  async partUpload(req: Request, res: Response) {
    const partUploadSchema = plainToInstance(PartUpload, req.headers)
    await validateOrReject(partUploadSchema, {
      validationError: {
        transformFunction: (key: string) => req.t(`validation.${key}`)
      },
    })
    const result = await this.service.partUpload(req, res, partUploadSchema)
    return {
      message: req.t('controller.create', { module: singularize(kebabToPascal(req.params.module as string)) }),
      data: result
    }
  }
  @PUT()
  async multipartEnd(req: Request, res: Response) {
    const multipartEndSchema = plainToInstance(MultipartEnd, req.body)
    await validateOrReject(multipartEndSchema, {
      validationError: {
        transformFunction: (key: string) => req.t(`validation.${key}`)
      },
    })
    const result = await this.service.multipartEnd(req, res, multipartEndSchema)
    return {
      message: req.t('controller.create', { module: singularize(kebabToPascal(req.params.module as string)) }),
      data: result
    }
  }
  @POST()
  async upload(req: Request, res: Response) {
    const original = { ...req.query, file_size: parseInt(req.query.file_size as string) }
    const sanitized = await this._validate(original, req.t);
    const data = await this.service.upload(req, res, sanitized)
    res.status(201)
    return {
      message: req.t('controller.create', { module: singularize(kebabToPascal(req.params.module as string)) }),
      data: data
    };
  }

};
export default new ChatMediaController();
