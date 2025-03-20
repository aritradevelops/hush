import { Base64Utils } from "./base64";

/**
 * Handles RSA key pair generation, encryption, and decryption.
 * 
 * RSA (Rivest-Shamir-Adleman) is an asymmetric cryptographic algorithm that uses a
 * public key for encryption and a private key for decryption.
 * 
 * - The public key can be freely shared and is used to encrypt data.
 * - The private key is kept secret and is used to decrypt data.
 * - This implementation uses RSA-OAEP (Optimal Asymmetric Encryption Padding),
 *   which provides better security than older padding schemes.
 */
export class RSAKeyPair {
  private static readonly modulusLength = 4096;
  /**
   * Generates an RSA key pair and returns the keys as Base64-encoded strings.
   * The generated key pair is 4096 bits long for strong security.
   * 
   * @returns A promise resolving to an object containing Base64-encoded public and private keys.
   */
  static async generate(): Promise<{ publicKey: string; privateKey: string }> {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: RSAKeyPair.modulusLength, // Higher bit-length = stronger security
        publicExponent: new Uint8Array([1, 0, 1]), // Common exponent value (65537)
        hash: "SHA-256", // Hash function used for encryption
      },
      true, // Keys are extractable (exportable)
      ["encrypt", "decrypt"] // Public key encrypts, private key decrypts
    );

    const publicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
    const privateKey = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

    return {
      publicKey: Base64Utils.encode(new Uint8Array(publicKey)),
      privateKey: Base64Utils.encode(new Uint8Array(privateKey)),
    };
  }
  /**
   * Formats a Base64-encoded key into PEM format.
   * @param base64Key - The Base64-encoded key.
   * @param label - The type of key ("PUBLIC KEY" or "PRIVATE KEY").
   * @returns The PEM-formatted key as a string.
   */
  static formatPEM(base64Key: string, label: string): string {
    const lineLength = 64;
    const formattedKey = base64Key.match(new RegExp(`.{1,${lineLength}}`, "g"))?.join("\n") || base64Key;
    return `-----BEGIN ${label}-----\n${formattedKey}\n-----END ${label}-----`;
  }

  /**
   * Extracts the Base64-encoded content from a PEM-formatted key.
   * 
   * @param pemString - The PEM-formatted key as a string.
   * @returns The Base64-encoded key string.
   */
  static importPem(pemString: string): string {
    return pemString.replace(/-----.*?-----/g, "").replace(/\s+/g, "");
  }

  /**
   * Encrypts data using an RSA public key (Standard RSA encryption).
   * 
   * @param data - The data to encrypt as a Uint8Array.
   * @param publicKeyBase64 - The RSA public key in Base64 format.
   * @returns A promise resolving to the encrypted data as a Base64 string.
   */
  static async encryptWithPublicKey(data: Uint8Array, publicKeyBase64: string): Promise<string> {
    const publicKeyBuffer = Base64Utils.decode(publicKeyBase64);
    const publicKey = await window.crypto.subtle.importKey("spki", publicKeyBuffer, { name: "RSA-OAEP", hash: "SHA-256" }, false, ["encrypt"]);

    const encrypted = await window.crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, data);
    return Base64Utils.encode(new Uint8Array(encrypted));
  }

  /**
   * Decrypts data using an RSA private key.
   * 
   * @param encryptedDataBase64 - The Base64-encoded encrypted data.
   * @param privateKeyBase64 - The RSA private key in Base64 format.
   * @returns A promise resolving to the decrypted data as a Uint8Array.
   */
  static async decryptWithPrivateKey(encryptedDataBase64: string, privateKeyBase64: string): Promise<Uint8Array> {
    const privateKeyBuffer = Base64Utils.decode(privateKeyBase64);
    const privateKey = await window.crypto.subtle.importKey("pkcs8", privateKeyBuffer, { name: "RSA-OAEP", hash: "SHA-256" }, false, ["decrypt"]);

    const encryptedBuffer = Base64Utils.decode(encryptedDataBase64);
    const decrypted = await window.crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, encryptedBuffer);
    return new Uint8Array(decrypted);
  }

  /**
   * Encrypts data using an RSA private key (Used for Digital Signatures).
   * 
   * @param data - The data to sign (encrypt) as a Uint8Array.
   * @param privateKeyBase64 - The RSA private key in Base64 format.
   * @returns A promise resolving to the signed data as a Base64 string.
   */
  static async encryptWithPrivateKey(data: Uint8Array, privateKeyBase64: string): Promise<string> {
    const privateKeyBuffer = Base64Utils.decode(privateKeyBase64);
    const privateKey = await window.crypto.subtle.importKey("pkcs8", privateKeyBuffer, { name: "RSA-PSS", hash: "SHA-256" }, false, ["sign"]);

    const signature = await window.crypto.subtle.sign(
      { name: "RSA-PSS", saltLength: 32 },
      privateKey,
      data
    );

    return Base64Utils.encode(new Uint8Array(signature));
  }

  /**
   * Verifies and decrypts data using an RSA public key.
   * 
   * @param signedDataBase64 - The Base64-encoded signed data.
   * @param originalData - The original data as a Uint8Array.
   * @param publicKeyBase64 - The RSA public key in Base64 format.
   * @returns A promise resolving to a boolean indicating whether the signature is valid.
   */
  static async decryptWithPublicKey(signedDataBase64: string, originalData: Uint8Array, publicKeyBase64: string): Promise<boolean> {
    const publicKeyBuffer = Base64Utils.decode(publicKeyBase64);
    const publicKey = await window.crypto.subtle.importKey("spki", publicKeyBuffer, { name: "RSA-PSS", hash: "SHA-256" }, false, ["verify"]);

    const signedData = Base64Utils.decode(signedDataBase64);

    return window.crypto.subtle.verify(
      { name: "RSA-PSS", saltLength: 32 },
      publicKey,
      signedData,
      originalData
    );
  }
}

/**
* Handles AES-GCM encryption and decryption.
* 
* AES-GCM (Advanced Encryption Standard - Galois/Counter Mode) is a symmetric
* encryption algorithm that provides both confidentiality and authentication.
* 
* - AES uses a shared secret key for encryption and decryption.
* - GCM mode ensures message integrity by generating an authentication tag.
* - A unique IV (Initialization Vector) is required for each encryption operation.
*/
class AESGCM {
  /**
   * Generates a 256-bit random AES key.
   * 
   * - The key is used for AES encryption/decryption.
   * - It must be securely shared using RSA encryption.
   * 
   * @returns A Uint8Array containing the randomly generated AES key.
   */
  static generateKey(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(32)); // 256-bit key
  }

  /**
   * Encrypts a message using AES-GCM.
   * 
   * - Generates a random 12-byte IV (nonce).
   * - Uses the AES key to encrypt the message.
   * - Returns both the encrypted data and IV, as IV is needed for decryption.
   * 
   * @param plaintext - The message to encrypt.
   * @param sharedSecret - The AES key as a Uint8Array.
   * @returns A promise resolving to an object containing Base64-encoded encrypted data and IV.
   */
  static async encrypt(plaintext: string, sharedSecret: Uint8Array): Promise<{ encrypted: string; iv: string }> {
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 12-byte IV for AES-GCM
    const key = await crypto.subtle.importKey("raw", sharedSecret, { name: "AES-GCM" }, true, ["encrypt"]);

    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(plaintext));

    return {
      encrypted: Base64Utils.encode(new Uint8Array(encrypted)),
      iv: Base64Utils.encode(iv),
    };
  }

  /**
   * Decrypts an AES-GCM encrypted message.
   * 
   * - Requires the same AES key and IV used during encryption.
   * - Authenticates the message to ensure data integrity.
   * 
   * @param encryptedMessage - The Base64-encoded encrypted message.
   * @param iv - The Base64-encoded IV used for encryption.
   * @param sharedSecret - The AES key as a Uint8Array.
   * @returns A promise resolving to the decrypted plaintext string.
   */
  static async decrypt(encryptedMessage: string, iv: string, sharedSecret: Uint8Array): Promise<string> {
    try {
      const ivBytes = Base64Utils.decode(iv);
      const encryptedBytes = Base64Utils.decode(encryptedMessage);

      const key = await crypto.subtle.importKey("raw", sharedSecret, { name: "AES-GCM" }, true, ["decrypt"]);
      const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: ivBytes }, key, encryptedBytes);

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error("Decryption error:", error);
      throw new Error("Failed to decrypt message");
    }
  }
}


