import { CompleteMultipartUploadCommand, CreateMultipartUploadCommand, PutObjectCommand, S3Client, UploadPartCommand } from "@aws-sdk/client-s3";
import { MediaProvider } from "./media.provider";
import env from "../../lib/env";
import { HttpStatusCode } from "axios";
import pathM from 'path'
export class AwsS3Provider implements MediaProvider {
  private client: S3Client
  private pathToDir: string
  private bucketName: string
  private partMap = new Map<string, { ETag: string, PartNumber: number }[]>
  constructor() {
    this.client = new S3Client({
      region: env.get('AWS_S3_BUCKET_REGION'),
      credentials: {
        accessKeyId: env.get('AWS_S3_ACCESS_KEY'),
        secretAccessKey: env.get('AWS_S3_SECRET_KEY')
      }
    })
    this.pathToDir = env.get('AWS_S3_PATH_TO_DIR')
    this.bucketName = env.get('AWS_S3_BUCKET_NAME')
  }
  private getFullPath(path: string) {
    return pathM.join(this.pathToDir, path)
  }
  async multipartInit(path: string) {
    console.debug(this.getFullPath(path))
    const response = await this.client.send(new CreateMultipartUploadCommand({
      Bucket: this.bucketName,
      Key: this.getFullPath(path)
    }))
    this.partMap.set(response.UploadId!, [])
    return { id: response.UploadId! }
  }
  async partUpload(path: string, id: string, partNumber: number, content: Buffer) {
    const response = await this.client.send(new UploadPartCommand({
      Bucket: this.bucketName,
      Key: this.getFullPath(path),
      PartNumber: partNumber,
      UploadId: id,
      Body: content
    }))
    this.partMap.set(id, [...this.partMap.get(id)!, { ETag: response.ETag!, PartNumber: partNumber }])
    return response.$metadata.httpStatusCode === HttpStatusCode.Ok;
  }
  async multipartEnd(path: string, id: string): Promise<boolean> {
    const response = await this.client.send(new CompleteMultipartUploadCommand({
      Bucket: this.bucketName,
      Key: this.getFullPath(path),
      UploadId: id,
      MultipartUpload: {
        Parts: this.partMap.get(id)?.sort((a, b) => a.PartNumber - b.PartNumber)
      }
    }))
    this.partMap.delete(id)
    return response.$metadata.httpStatusCode === HttpStatusCode.Ok;
  }
  async upload(path: string, data: Buffer): Promise<boolean> {
    const response = await this.client.send(new PutObjectCommand({
      Bucket: this.bucketName,
      Key: this.getFullPath(path),
      Body: data
    }))
    return response.$metadata.httpStatusCode === HttpStatusCode.Ok;
  }

  async getUrl(path: string) {
    return `https://${this.bucketName}.s3.${env.get('AWS_S3_BUCKET_REGION')}.amazonaws.com/${this.getFullPath(path)}`
  }

}