'use client'

import { AESCTR } from '@/lib/encryption'
import httpClient from '@/lib/http-client'
import keysManager from '@/lib/internal/keys-manager'
import { ChatMedia } from '@/types/entities'
import { randomUUID } from 'crypto'
import mime from 'mime'
import QueryString from 'qs'
import { useEffect, useRef, useState } from 'react'
import * as uuid from 'uuid'

const email = 'chrome@gmail.com'

export default function Page() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatId = 'b0a75629-54be-4754-af1d-a4a447968a91'
  const channelId = '47b97482-525b-4af0-a28c-b7c1c0e5f41c'
  const uploadLimit = 5 * 1024 * 1024 // 5MB in bytes (more readable)
  const [medias, setMedias] = useState<ChatMedia[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleUpload = async () => {
    const fileInput = fileInputRef.current
    if (!fileInput?.files || fileInput.files.length === 0) {
      // console.log('No file selected')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const file: File = fileInput.files[0]
      const sharedSecret = await keysManager.getSharedSecret(channelId, email)
      await new Promise((res, rej) => {
        const uploadWorker = new window.Worker('/workers/upload-encrypt.worker.js', {
          type: 'module',
          name: file.name + 'uploader'
        })
        uploadWorker.postMessage({
          file: file,
          chatMedia: {
            id: uuid.v4(),
            name: file.name,
            chat_id: chatId,
            channel_id: channelId,
            mime_type: mime.getType(file.name)!,
          },
          sharedSecret: sharedSecret
        })
        uploadWorker.addEventListener("message", e => {
          console.log(e)
          uploadWorker.terminate()
          res(e.data)
        })
        uploadWorker.addEventListener('error', rej)
      })

      // Refresh media list
      const updatedMedias = await httpClient.listMedias()
      setMedias(updatedMedias.data)

      // Reset form
      if (fileInput) {
        fileInput.value = ''
      }

    } catch (error) {
      console.error('Upload failed:', error)
      // @ts-ignore
      alert(`Upload failed: ${error.message}`)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  useEffect(() => {
    httpClient.listMedias()
      .then((data) => {
        setMedias(data.data)
      })
      .catch(console.error)
  }, [])

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Encrypted File Upload</h1>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="file"
          ref={fileInputRef}
          disabled={isUploading}
          style={{ marginRight: '10px' }}
        />
        <button
          type="button"
          onClick={handleUpload}
          disabled={isUploading}
          style={{
            padding: '8px 16px',
            backgroundColor: isUploading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isUploading ? 'not-allowed' : 'pointer'
          }}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      {isUploading && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '5px' }}>Upload Progress: {Math.round(uploadProgress)}%</div>
          <div style={{
            width: '100%',
            backgroundColor: '#f0f0f0',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${uploadProgress}%`,
              height: '20px',
              backgroundColor: '#007bff',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
        </div>
      )}

      <hr style={{ margin: '20px 0' }} />

      <h2>Uploaded Media Files</h2>
      {medias.length === 0 ? (
        <p>No media files found.</p>
      ) : (
        <div>
          {medias.map(media => (
            <div key={media.id} style={{ marginBottom: '20px' }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>{media.name}</strong> ({media.mime_type})
              </div>
              {media.mime_type?.startsWith('video/') && (
                <RenderVideo media={media} />
              )}
              {media.mime_type?.startsWith('image/') && (
                <RenderImage media={media} />
              )}
              <details style={{ marginTop: '10px' }}>
                <summary>Media Details</summary>
                <pre style={{
                  backgroundColor: '#f5f5f5',
                  padding: '10px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '12px'
                }}>
                  {JSON.stringify(media, null, 2)}
                </pre>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function RenderVideo({ media }: { media: ChatMedia }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const workerRef = useRef<Worker | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  const decryptWithWorker = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get shared secret
      const sharedSecret = await keysManager.getSharedSecret(media.channel_id, email)

      // Create worker
      const worker = new window.Worker('/workers/download-decrypt.worker.js', {
        type: 'module'
      })
      workerRef.current = worker

      // Set up worker message handler
      const workerPromise = new Promise<ArrayBuffer>((resolve, reject) => {
        worker.onmessage = (e: MessageEvent<{ error: any, data: { decrypted: ArrayBuffer } | null }>) => {
          const { error, data } = e.data

          if (error) {
            reject(error)
          } else if (data) {
            resolve(data.decrypted)
          } else {
            reject(new Error('No data received from worker'))
          }
        }

        worker.onerror = (error) => {
          reject(error)
        }
      })

      // Send decryption task to worker
      worker.postMessage({
        media,
        sharedSecret
      })

      // Wait for decryption result
      const decryptedBuffer = await workerPromise

      // Create blob and object URL
      const blob = new Blob([decryptedBuffer], { type: media.mime_type })
      const url = URL.createObjectURL(blob)

      setVideoUrl(url)
      setLoading(false)

    } catch (err) {
      console.error('Failed to decrypt video:', err)
      // @ts-ignore
      setError(err.message || 'Failed to load video')
      setLoading(false)
    }
  }

  useEffect(() => {
    decryptWithWorker()

    // Cleanup function
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl)
      }
      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }
    }
  }, [media.id])

  if (loading) {
    return <div>Decrypting video...</div>
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>
  }

  return (
    <video
      ref={videoRef}
      src={videoUrl || ''}
      controls
      style={{ maxWidth: '100%', height: 'auto' }}
      onError={(e) => {
        console.error('Video playback error:', e)
        setError('Video playback failed')
      }}
    >
      Your browser does not support the video tag.
    </video>
  )
}

function RenderImage({ media }: { media: ChatMedia }) {
  const downloadLimit = 1024 * 1024 // 1MB chunks
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const getDecryptedBlob = async () => {
    try {
      setLoading(true)
      setError(null)
      let combinedBuffer = new Uint8Array(media.file_size)
      if (media.file_size > downloadLimit) {
        const parts = Math.ceil(media.file_size / downloadLimit)
        const partPromises: Promise<ArrayBuffer>[] = []

        // Download all parts
        for (let i = 0; i < parts; i++) {
          const start = i * downloadLimit
          const end = Math.min((i + 1) * downloadLimit, media.file_size) - 1

          partPromises.push(
            fetch(media.cloud_storage_url, {
              headers: {
                Range: `bytes=${start}-${end}`
              }
            }).then(res => {
              if (!res.ok) {
                throw new Error(`Failed to download part ${i + 1}: ${res.statusText}`)
              }
              return res.arrayBuffer()
            })
          )
        }

        const partBuffers = await Promise.all(partPromises)

        // Combine all parts into a single ArrayBuffer
        // const totalSize = partBuffers.reduce((sum, buffer) => sum + buffer.byteLength, 0)
        // const combinedBuffer = new ArrayBuffer(totalSize)
        const combinedView = new Uint8Array(combinedBuffer)

        let offset = 0
        for (const buffer of partBuffers) {
          combinedView.set(new Uint8Array(buffer), offset)
          offset += buffer.byteLength
        }
      } else {
        const res = await fetch(media.cloud_storage_url)
        const buffer = await res.arrayBuffer()
        combinedBuffer = new Uint8Array(buffer)
      }

      // Decrypt the combined buffer
      const sharedSecret = await keysManager.getSharedSecret(media.channel_id, email)
      const { decrypted } = await AESCTR.decrypt(combinedBuffer, media.iv, sharedSecret)
      // const { decrypted } = { decrypted: combinedBuffer }

      // Create blob and object URL
      const blob = new Blob([decrypted], { type: media.mime_type })
      const url = URL.createObjectURL(blob)

      setImageUrl(url)
      setLoading(false)

    } catch (err) {
      console.error('Failed to decrypt image:', err)
      // @ts-ignore
      setError(err.message || 'Failed to load image')
      setLoading(false)
    }
  }

  useEffect(() => {
    getDecryptedBlob()

    // Cleanup function to revoke object URL
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl)
      }
    }
  }, [media.id])

  if (loading) {
    return <div>Loading image...</div>
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>
  }

  return (
    <img
      src={imageUrl || ''}
      alt={media.name}
      style={{ maxWidth: '100%', height: 'auto' }}
      onError={() => {
        setError('Image display failed')
      }}
    />
  )
}
