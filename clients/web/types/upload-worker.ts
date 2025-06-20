import { ChatMedia } from "./entities"

export type ProgressMessage = {
  type: 'progress',
  data: number
}
export type FinalMessage = {
  type: 'final'
  data: ChatMedia
  error: string
}
export type ProgressCallback = (p: number) => void

export type WorkerMessage = ProgressMessage | FinalMessage
export type UploadMessage = {
  type: 'init'
  file: File
  sharedSecret: Uint8Array
  apiUrl: string
  chatMedia: ChatMedia
}