import { ChatMedia } from "@/types/entities"
import { FinalMessage, ProgressMessage, UploadMessage } from "@/types/upload-worker"


const CHUNK_SIZE = 5 * 1 << 20 //5 mb
const MIN_MULTIPART_SIZE = 2 * CHUNK_SIZE

self.onmessage = async (e: MessageEvent<UploadMessage>) => {
  const { file, chatMedia, sharedSecret, apiUrl } = e.data
  const buf = await file.arrayBuffer()
  const { encrypted, iv } = await AESCTR.encrypt(buf, sharedSecret)
  if (encrypted.byteLength > MIN_MULTIPART_SIZE) {
    try {
      // Initialize multipart upload
      const res = await fetch(apiUrl + '/v1/chat-media/multipart-init', {
        method: 'POST',
        body: JSON.stringify({
          id: chatMedia.id,
          name: file.name,
          chat_id: chatMedia.chat_id,
          channel_id: chatMedia.channel_id,
          mime_type: file.type,
          file_size: encrypted.byteLength,
          iv: iv
        }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })

      if (!res.ok) {
        throw new Error(`Failed to initialize upload: ${res.statusText}`)
      }

      const multipartRes = await res.json()
      // console.log('Encrypted file size:', encrypted.byteLength)

      const parts = Math.ceil(encrypted.byteLength / CHUNK_SIZE)
      // console.log('Number of parts:', parts)

      const partPromises: Array<Promise<any>> = []

      for (let i = 0; i < parts; i++) {
        const start = i * CHUNK_SIZE
        const end = Math.min((i + 1) * CHUNK_SIZE, encrypted.byteLength)
        const chunk = encrypted.slice(start, end)

        // console.log(`Part ${i + 1}: ${start}-${end - 1} (${chunk.byteLength} bytes)`)
        const params = new URLSearchParams({
          'path': multipartRes.data.path,
          'multipart_id': multipartRes.data.multipart_id,
          'part_number': String(i + 1)
        })
        partPromises.push(
          fetch(apiUrl + '/v1/chat-media/part-upload?' + params.toString(), {
            method: 'PUT',
            body: chunk,
            headers: {
              'Content-Type': 'application/octet-stream',
            },
            credentials: 'include'
          })
            .then(res => {
              if (!res.ok) {
                throw new Error(`Part ${i + 1} upload failed: ${res.statusText}`)
              }
              return res.json()
            })
            .then(data => {
              // console.log(`Part ${i + 1} uploaded:`, data)
              return data
            })
            .catch(error => {
              console.error(`Part ${i + 1} upload failed:`, error)
              throw error
            })
        )
      }

      await Promise.all(partPromises)
      // console.log('All parts uploaded successfully')

      // Complete multipart upload
      const result = await fetch(apiUrl + '/v1/chat-media/multipart-end', {
        method: 'PUT',
        body: JSON.stringify({
          id: multipartRes.data.id,
          path: multipartRes.data.path,
          multipart_id: multipartRes.data.multipart_id
        }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })

      if (!result.ok) {
        throw new Error(`Failed to complete upload: ${result.statusText}`)
      }

      const finalResult: { data: ChatMedia, error: string, message: string } = await result.json()
      // console.log('Upload completed:', finalResult)
      self.postMessage({
        type: 'final',
        data: finalResult.data,
        error: finalResult.error,
      } as FinalMessage)
    } catch (error) {
      console.error(error)
      self.postMessage({
        data: null,
        error: error
      })
    }
  } else {
    const params = new URLSearchParams({
      id: chatMedia.id,
      name: file.name,
      chat_id: chatMedia.chat_id as string,
      channel_id: chatMedia.channel_id,
      mime_type: file.type,
      file_size: String(encrypted.byteLength),
      iv: iv
    })
    const xhr = new XMLHttpRequest();
    xhr.open('POST', apiUrl + '/v1/chat-media/upload?' + params.toString())
    xhr.withCredentials = true
    xhr.setRequestHeader('Content-Type', 'application/octet-stream')
    xhr.upload.addEventListener("progress", function (event) {
      self.postMessage({
        type: 'progress',
        data: event.loaded / event.total
      } as ProgressMessage)
    })
    const res: Promise<any> = new Promise(r => {
      xhr.addEventListener("load", function () {
        // console.log(xhr.status)
        // console.log(xhr.responseText)
        r(JSON.parse(xhr.responseText))
      })
    })
    xhr.send(encrypted)
    const { data, error } = await res
    // console.log(data, error)
    self.postMessage({
      type: "final",
      error: error,
      data: data
    } as FinalMessage)
  }
}


class AESCTR {
  static async encrypt(buffer: ArrayBuffer, sharedSecret: Uint8Array) {
    const iv = crypto.getRandomValues(new Uint8Array(16)); // 16-byte IV for AES-CTR
    const key = await crypto.subtle.importKey(
      'raw',
      sharedSecret,
      { name: 'AES-CTR' },
      false,
      ['encrypt']
    )

    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-CTR',
        counter: iv,
        length: 64
      },
      key,
      buffer
    )
    return { encrypted, iv: Base64Utils.encode(iv) }
  }
  static async decrypt(encryptedData: BufferSource, base64IV: string, rawKey: Uint8Array): Promise<{ decrypted: ArrayBuffer }> {
    const key = await crypto.subtle.importKey(
      "raw",
      rawKey,
      { name: "AES-CTR" },
      false,
      ["decrypt"]
    )

    const iv = Base64Utils.decode(base64IV) // 16 bytes

    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-CTR",
        counter: iv,
        length: 64
      },
      key,
      encryptedData
    )

    return { decrypted }
  }
}
/**
 * Utility class for encoding and decoding Base64.
 * 
 * JavaScript's `btoa` and `atob` work on binary strings.
 * Since `Uint8Array` stores raw bytes, we use `String.fromCharCode(...data)`
 * to convert the byte array to a string, then encode it using Base64.
 */
class Base64Utils {
  /**
   * Encodes a Uint8Array to a Base64 string.
   * @param data - The binary data to encode.
   * @returns The Base64-encoded string.
   */
  static encode(data: Uint8Array): string {
    return btoa(String.fromCharCode(...data));
  }

  /**
   * Decodes a Base64 string back into a Uint8Array.
   * @param base64 - The Base64-encoded string.
   * @returns The decoded Uint8Array.
   */
  static decode(base64: string): Uint8Array {
    return new Uint8Array(atob(base64).split("").map(c => c.charCodeAt(0)));
  }
}