
export type InitMessage = {
  type: 'init',
  data: {
    sharedSecret: string,
    iv: string
  }
}

export type EncryptMessage = {
  type: 'encrypt',
  data: {
    readable: ReadableStream
    writable: WritableStream
  }
}
export type DecryptMessage = {
  type: 'decrypt',
  data: {
    readable: ReadableStream
    writable: WritableStream
  }
}

export type PeerWorkerMessage = InitMessage | EncryptMessage | DecryptMessage