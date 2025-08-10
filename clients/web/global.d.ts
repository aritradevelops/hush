interface RTCConfiguration {
  encodedInsertableStreams?: boolean;
}

interface RTCRtpSender {
  createEncodedStreams?: () => {
    readable: ReadableStream<any>;
    writable: WritableStream<any>;
  };
}

interface RTCRtpReceiver {
  createEncodedStreams?: () => {
    readable: ReadableStream<any>;
    writable: WritableStream<any>;
  };
}
