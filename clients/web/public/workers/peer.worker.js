/*
 * This is a worker doing the encode/decode transformations to add end-to-end
 * encryption to a WebRTC PeerConnection using the Insertable Streams API.
 */
'use strict';
// These values will be populated during init call
let sharedSecret = '';
let iv = '';
let isInitialized = false;
// If using crypto offset (controlled by a checkbox):
// Do not encrypt the first couple of bytes of the payload. This allows
// a middle to determine video keyframes or the opus mode being used.
// For VP8 this is the content described in
//   https://tools.ietf.org/html/rfc6386#section-9.1
// which is 10 bytes for key frames and 3 bytes for delta frames.
// For opus (where encodedFrame.type is not set) this is the TOC byte from
//   https://tools.ietf.org/html/rfc6716#section-3.1
// TODO: make this work for other codecs.
//
// It makes the (encrypted) video and audio much more fun to watch and listen to
// as the decoder does not immediately throw a fatal error.
const frameTypeToCryptoOffset = {
    key: 10,
    delta: 3,
    undefined: 1,
};
function dump(encodedFrame, direction, max = 16) {
    const data = new Uint8Array(encodedFrame.data);
    let bytes = '';
    for (let j = 0; j < data.length && j < max; j++) {
        bytes += (data[j] < 16 ? '0' : '') + data[j].toString(16) + ' ';
    }
    const metadata = encodedFrame.getMetadata();
    console.debug(performance.now().toFixed(2), direction, bytes.trim(), 'len=' + encodedFrame.data.byteLength, 'type=' + (encodedFrame.type || 'audio'), 'ts=' + (metadata.rtpTimestamp || encodedFrame.timestamp), 'ssrc=' + metadata.synchronizationSource, 'pt=' + (metadata.payloadType || '(unknown)'), 'mimeType=' + (metadata.mimeType || '(unknown)'));
}
// Handler for messages, including transferable streams.
self.onmessage = (event) => {
    switch (event.data.type) {
        case 'init': {
            sharedSecret = event.data.data.sharedSecret;
            iv = event.data.data.iv;
            isInitialized = true;
            console.debug(sharedSecret, iv);
            break;
        }
        case 'encrypt': {
            if (!isInitialized)
                console.error("Peer worker is not initialized");
            let frameCount = 0;
            const transformStream = new TransformStream({
                async transform(chunk, controller) {
                    // Dump first 30 frames
                    if (frameCount++ < 30) {
                        dump(chunk, 'send');
                    }
                    // Encrypt `chunk.data` with AES
                    const { encrypted } = await AESCTR.encrypt(chunk.data, Base64Utils.decode(sharedSecret), iv);
                    chunk.data = encrypted;
                    controller.enqueue(chunk);
                },
            });
            event.data.data.readable
                .pipeThrough(transformStream)
                .pipeTo(event.data.data.writable);
            break;
        }
        case 'decrypt': {
            if (!isInitialized)
                console.error("Peer worker is not initialized");
            let frameCount = 0;
            const transformStream = new TransformStream({
                async transform(chunk, controller) {
                    if (frameCount++ < 30) {
                        dump(chunk, 'receive');
                    }
                    // Decrypt `chunk.data` with AES
                    const { decrypted } = await AESCTR.decrypt(chunk.data, iv, Base64Utils.decode(sharedSecret));
                    chunk.data = decrypted;
                    // Dump first 30 frames
                    controller.enqueue(chunk);
                },
            });
            event.data.data.readable
                .pipeThrough(transformStream)
                .pipeTo(event.data.data.writable);
            break;
        }
    }
};
// Handler for RTCRtpScriptTransforms.
// @ts-ignore
if (self.RTCTransformEvent) {
    self.onrtctransform = (event) => {
        const transformer = event.transformer;
        switch (transformer.options.operation) {
            case 'encrypt': {
                if (!isInitialized)
                    console.error("Peer worker is not initialized");
                let frameCount = 0;
                const transformStream = new TransformStream({
                    async transform(chunk, controller) {
                        // Dump first 30 frames
                        if (frameCount++ < 30) {
                            dump(chunk, 'send');
                        }
                        // Encrypt `chunk.data` with AES
                        const { encrypted } = await AESCTR.encrypt(chunk.data, Base64Utils.decode(sharedSecret), iv);
                        chunk.data = encrypted;
                        controller.enqueue(chunk);
                    },
                });
                transformer.readable
                    .pipeThrough(transformStream)
                    .pipeTo(transformer.writable);
                break;
            }
            case 'decrypt': {
                if (!isInitialized)
                    console.error("Peer worker is not initialized");
                let frameCount = 0;
                const transformStream = new TransformStream({
                    async transform(chunk, controller) {
                        // Dump first 30 frames
                        if (frameCount++ < 30) {
                            dump(chunk, 'receive');
                        }
                        // Decrypt `chunk.data` with AES
                        const { decrypted } = await AESCTR.decrypt(chunk.data, iv, Base64Utils.decode(sharedSecret));
                        chunk.data = decrypted;
                        controller.enqueue(chunk);
                    },
                });
                transformer.readable
                    .pipeThrough(transformStream)
                    .pipeTo(transformer.writable);
                break;
            }
        }
    };
}
export class AESCTR {
    static async encrypt(buffer, sharedSecret, base64IV) {
        let iv;
        if (base64IV) {
            iv = Base64Utils.decode(base64IV);
        }
        else {
            iv = crypto.getRandomValues(new Uint8Array(16)); // 16-byte IV for AES-CTR
        }
        const key = await crypto.subtle.importKey('raw', sharedSecret, { name: 'AES-CTR' }, false, ['encrypt']);
        const encrypted = await crypto.subtle.encrypt({
            name: 'AES-CTR',
            counter: iv,
            length: 64
        }, key, buffer);
        return { encrypted, iv: base64IV || Base64Utils.encode(iv) };
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
export class Base64Utils {
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
