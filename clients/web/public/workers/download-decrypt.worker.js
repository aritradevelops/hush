const CHUNK_SIZE = 1 << 20; // 1 MB
self.onmessage = (e) => {
    const { media, sharedSecret } = e.data;
    console.log('ssd', Base64Utils.encode(sharedSecret));
    const partLen = Math.ceil(media.file_size / CHUNK_SIZE);
    const partPromises = [];
    for (let i = 0; i < partLen; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min((i + 1) * CHUNK_SIZE, media.file_size) - 1;
        partPromises.push(fetch(media.cloud_storage_url, {
            headers: {
                Range: `bytes=${start}-${end}`
            }
        }).then(res => {
            if (!res.ok) {
                throw new Error(`Failed to download part ${i + 1}: ${res.statusText}`);
            }
            return res.arrayBuffer();
        }));
    }
    Promise.all(partPromises)
        .then((partBuffers) => {
        const totalSize = partBuffers.reduce((sum, buffer) => sum + buffer.byteLength, 0);
        const combinedBuffer = new ArrayBuffer(totalSize);
        const combinedView = new Uint8Array(combinedBuffer);
        let offset = 0;
        for (const buffer of partBuffers) {
            combinedView.set(new Uint8Array(buffer), offset);
            offset += buffer.byteLength;
        }
        return AESCTR.decrypt(combinedBuffer, media.iv, sharedSecret);
    })
        .then(result => {
        self.postMessage({
            error: null,
            data: result
        });
    })
        .catch(e => {
        self.postMessage({
            error: e,
            data: null
        });
    });
};
class AESCTR {
    static async encrypt(buffer, sharedSecret) {
        const iv = crypto.getRandomValues(new Uint8Array(16)); // 16-byte IV for AES-CTR
        const key = await crypto.subtle.importKey('raw', sharedSecret, { name: 'AES-CTR' }, false, ['encrypt']);
        const encrypted = await crypto.subtle.encrypt({
            name: 'AES-CTR',
            counter: iv,
            length: 64
        }, key, buffer);
        return { encrypted, iv: Base64Utils.encode(iv) };
    }
    static async decrypt(encryptedData, base64IV, rawKey) {
        const key = await crypto.subtle.importKey("raw", rawKey, { name: "AES-CTR" }, false, ["decrypt"]);
        const iv = Base64Utils.decode(base64IV); // 16 bytes
        const decrypted = await crypto.subtle.decrypt({
            name: "AES-CTR",
            counter: iv,
            length: 64
        }, key, encryptedData);
        return { decrypted };
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
    static encode(data) {
        return btoa(String.fromCharCode(...data));
    }
    /**
     * Decodes a Base64 string back into a Uint8Array.
     * @param base64 - The Base64-encoded string.
     * @returns The decoded Uint8Array.
     */
    static decode(base64) {
        return new Uint8Array(atob(base64).split("").map(c => c.charCodeAt(0)));
    }
}
export {};
