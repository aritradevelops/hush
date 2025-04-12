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