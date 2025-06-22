import { ChatMedia } from "@/types/entities";
import { ProgressCallback, UploadMessage, WorkerMessage } from "@/types/upload-worker";

export class UploadManager {
  private callbacks = new Map<string, ProgressCallback>()
  upload(chatMedia: ChatMedia, file: File, sharedSecret: Uint8Array): Promise<ChatMedia> {
    return new Promise((res, rej) => {
      const worker = new window.Worker('/workers/upload-encrypt.worker.js', {
        type: 'module',
        name: file.name + 'upload'
      })
      worker.postMessage({
        type: 'init',
        file,
        chatMedia,
        sharedSecret: sharedSecret,
        apiUrl: process.env.NEXT_PUBLIC_SERVER_URL
      } as UploadMessage)
      worker.addEventListener("error", e => rej(e))
      worker.addEventListener("message", (e: MessageEvent<WorkerMessage>) => {
        switch (e.data.type) {
          case 'progress': {
            this.publish(chatMedia.id, e.data.data)
            break;
          }
          case 'final': {
            worker.terminate()
            if (e.data.error) {
              rej(e.data.error)
            } else {
              res(e.data.data)
            }
            break;
          }
          default: {
            rej(e.data)
          }
        }
      })
    })
  }
  subscribe(mediaId: string, cb: ProgressCallback) {
    this.callbacks.set(mediaId, cb)
  }
  private publish(mediaId: string, p: number) {
    this.callbacks.get(mediaId)?.(p)
    if (p === 100) this.callbacks.delete(mediaId)
  }
}

export default new UploadManager()