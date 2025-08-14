import { UUID } from "crypto"
import { IndexDb } from "../indexdb"
import { Base64Utils } from "../base64"
import httpClient from "../http-client-old"
import { RSAKeyPair } from "../encryption"

export class KeysManager {
  private readonly ENCRYPTION_KEY_IDENTIFIER = "hush_encryption_key"
  private readonly SHARED_SECRET_IDENTIFIER = "shared_secret"
  private readonly PUBLIC_KEY_IDENTIFIER = "public_key"
  private readonly indexDb: IndexDb
  constructor() {
    this.indexDb = new IndexDb("hush_app", "hush_app")
  }

  async getEncryptionKey(identifier: string) {
    // Use the identifier (email) to create a user-specific key identifier
    // This allows for different encryption keys for different users on the same device
    const keyId = identifier ? `${this.ENCRYPTION_KEY_IDENTIFIER}_${identifier}` : this.ENCRYPTION_KEY_IDENTIFIER;
    return await this.indexDb.get<string>(keyId)
  }
  async setEncryptionKey(key: string, identifier?: string) {
    // Use the identifier (email) to create a user-specific key identifier
    const keyId = identifier ? `${this.ENCRYPTION_KEY_IDENTIFIER}_${identifier}` : this.ENCRYPTION_KEY_IDENTIFIER;
    await this.indexDb.set(keyId, key)
  }
  async getSharedSecret(channelId: UUID, identifier: string) {
    // console.debug('Getting shared secret for channel', channelId)
    const secretStr = await this.indexDb.get<string>(`${this.SHARED_SECRET_IDENTIFIER}_${channelId}`)
    // console.debug('Shared secret found', secretStr)
    if (secretStr) return Base64Utils.decode(secretStr)
    // console.debug('Shared secret not found, getting from server')

    const response = await httpClient.getSharedSecret(channelId)
    // console.debug('Shared secret response', response)
    const encryptedSharedSecret = response.data.encrypted_shared_secret
    const encryptionKey = await this.getEncryptionKey(identifier)
    if (!encryptionKey) throw new Error("Encryption key not found")
    const sharedSecret = await RSAKeyPair.decryptWithPrivateKey(encryptedSharedSecret, encryptionKey)
    await this.setSharedSecret(channelId, Base64Utils.encode(sharedSecret))
    return sharedSecret
  }
  async setSharedSecret(channelId: UUID, secret: string) {
    await this.indexDb.set(`${this.SHARED_SECRET_IDENTIFIER}_${channelId}`, secret)
  }
  async getPublicKey(userId: UUID) {
    const key = await this.indexDb.get<string>(`${this.PUBLIC_KEY_IDENTIFIER}_${userId}`)
    if (key) return key
    const response = await httpClient.getPublicKey(userId)
    const publicKey = response.data.public_key
    await this.setPublicKey(userId, publicKey)
    return publicKey
  }
  async setPublicKey(userId: UUID, publicKey: string) {
    await this.indexDb.set(`${this.PUBLIC_KEY_IDENTIFIER}_${userId}`, publicKey)
  }
}
export default new KeysManager()
