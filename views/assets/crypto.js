class CryptoUtil {
  static async generateKeyPair() {
    const keyPair = await window.crypto.subtle.generateKey(
      { name: "RSA-OAEP", modulusLength: 4096, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
      true, ["encrypt", "decrypt"]
    );

    const publicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
    const privateKey = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

    return {
      publicKey: btoa(String.fromCharCode(...new Uint8Array(publicKey))), // Base64 encode
      privateKey: btoa(String.fromCharCode(...new Uint8Array(privateKey))) // Base64 encode
    };
  }

  static async generateSharedSecret() {
    return crypto.getRandomValues(new Uint8Array(32)); // 256-bit AES key
  }

  static async encryptSharedKey(secret, receiverPublicKey) {
    const publicKeyBuffer = Uint8Array.from(atob(receiverPublicKey), c => c.charCodeAt(0));
    const key = await window.crypto.subtle.importKey("spki", publicKeyBuffer, { name: "RSA-OAEP", hash: "SHA-256" }, false, ["encrypt"]);

    const encrypted = await window.crypto.subtle.encrypt({ name: "RSA-OAEP" }, key, secret);
    return btoa(String.fromCharCode(...new Uint8Array(encrypted))); // Base64 encode
  }

  static async decryptSharedKey(encryptedSharedKey, privateKey) {
    const privateKeyBuffer = Uint8Array.from(atob(privateKey), c => c.charCodeAt(0));
    const key = await window.crypto.subtle.importKey("pkcs8", privateKeyBuffer, { name: "RSA-OAEP", hash: "SHA-256" }, false, ["decrypt"]);

    const decrypted = await window.crypto.subtle.decrypt({ name: "RSA-OAEP" }, key, Uint8Array.from(atob(encryptedSharedKey), c => c.charCodeAt(0)));
    return new Uint8Array(decrypted);
  }

  static async encryptMessage(plaintext, sharedSecret) {
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 12-byte IV for AES-GCM
    const key = await crypto.subtle.importKey("raw", sharedSecret, { name: "AES-GCM" }, true, ["encrypt"]);

    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(plaintext));

    return {
      encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))), // Base64 encode
      iv: btoa(String.fromCharCode(...iv)) // Base64 encode
    };
  }

  static async decryptMessage(encryptedMessage, iv, sharedSecret) {
    try {
      console.log("Decrypting message...");

      // Convert shared secret from Base64 string to Uint8Array
      const secretBytes = Uint8Array.from(atob(sharedSecret), c => c.charCodeAt(0));

      // Convert IV properly
      const ivBytes = new Uint8Array(atob(iv).split("").map(c => c.charCodeAt(0)));

      // Convert encrypted message properly
      const encryptedBytes = new Uint8Array(atob(encryptedMessage).split("").map(c => c.charCodeAt(0)));

      const key = await crypto.subtle.importKey("raw", secretBytes, { name: "AES-GCM" }, true, ["decrypt"]);

      const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: ivBytes }, key, encryptedBytes);

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error("Decryption error:", error);
      throw new Error("Failed to decrypt message");
    }
  }
}