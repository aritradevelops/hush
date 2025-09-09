import { constants } from "./constants";

export const RTC_CONFIG: RTCConfiguration = {
  encodedInsertableStreams: !constants.DISABLE_STREAM_ENCRYPTION,
  iceServers: [
    { urls: constants.STUN_SERVER_URLS }
  ]
}

export const isEncryptionPossible = () => {
  if (constants.DISABLE_STREAM_ENCRYPTION) return true
  let hasEnoughAPIs = !!window.RTCRtpScriptTransform;

  if (!hasEnoughAPIs) {
    const supportsInsertableStreams =
      !!RTCRtpSender.prototype.createEncodedStreams;

    let supportsTransferableStreams = false;
    try {
      const stream = new ReadableStream();
      window.postMessage(stream, '*', [stream]);
      supportsTransferableStreams = true;
    } catch (e) {
      console.error('Transferable streams are not supported.');
    }
    hasEnoughAPIs = supportsInsertableStreams && supportsTransferableStreams;
  }
  return hasEnoughAPIs
}