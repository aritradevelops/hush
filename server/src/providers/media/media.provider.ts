
export interface MediaProvider {
  getUrl(path: string): Promise<string>
  multipartInit(path: string): Promise<{ id: string }>
  partUpload(path: string, id: string, partNumber: number, content: Buffer): Promise<boolean>
  multipartEnd(path: string, id: string): Promise<boolean>
  upload(path: string, data: Buffer): Promise<boolean>
}