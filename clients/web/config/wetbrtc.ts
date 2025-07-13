import { constants } from "./constants";

export const RTC_CONFIG: RTCConfiguration = {
  // encodedInsertableStreams: true,
  iceServers: [
    { urls: constants.STUN_SERVER_URLS }
  ]
}