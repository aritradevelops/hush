export enum SocketClientEmittedEvent {


  // Contact Events
  CONTACT_ADD = 'contact:add',
  CONTACT_BLOCK = 'contact:block',
  CONTACT_UNBLOCK = 'contact:unblock',

  // Channel Events
  CHANNEL_MUTE = 'channel:mute',
  CHANNEL_NEW = 'channel:new',
  CHANNEL_PIN = 'channel:pin',
  CHANNEL_UNMUTE = 'channel:unmute',
  CHANNEL_UNPIN = 'channel:unpin',
  CHANNEL_SEEN = 'channel:seen',

  // Group Events
  GROUP_CREATE = 'group:create',
  GROUP_DELETE = 'group:delete',
  GROUP_JOIN = 'group:join',
  GROUP_LEAVE = 'group:leave',
  GROUP_MUTE = 'group:mute',
  GROUP_PIN = 'group:pin',
  GROUP_UNMUTE = 'group:unmute',
  GROUP_UNPIN = 'group:unpin',
  GROUP_UPDATE = 'group:update',

  // Message Events
  MESSAGE_PIN = 'message:pin',
  MESSAGE_SEEN = 'message:seen',
  MESSAGE_RECIEVED = 'message:recieved',
  MESSAGE_SEND = 'message:send',
  MESSAGE_UNPIN = 'message:unpin',

  // Typing Events
  TYPING_START = 'typing:start',
  TYPING_STOP = 'typing:stop',

  // Call Events
  CALL_STARTED = 'call:started',
  CALL_JOINED = 'call:joined',

  // RTC Events
  RTC_ICE_CANDIDATE = 'rtc:icecandidate',
  RTC_OFFER = 'rtc:offer',
  RTC_ANSWER = 'rtc:answer'

}

export enum SocketServerEmittedEvent {
  // Connection Events
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',

  // Message Events
  MESSAGE_RECEIVED = 'message:received',
  MESSAGE_DELIVERED = 'message:delivered',
  MESSAGE_SEEN = 'message:seen',

  // Typing Events
  TYPING_START = 'typing:start',
  TYPING_STOP = 'typing:stop',

  // Call Events
  CALL_STARTED = 'call:started',
  CALL_JOINED = 'call:joined',
  CALL_LEFT = 'call:left',
  CALL_ENDED = 'call:ended',
  CALL_RUNNING = 'call:running',

  // RTC Events
  RTC_ICE_CANDIDATE = 'rtc:icecandidate',
  RTC_OFFER = 'rtc:offer',
  RTC_ANSWER = 'rtc:answer'
}