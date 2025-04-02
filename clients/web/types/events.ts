export enum SocketEvent {
  // Connection Events
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',

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
  MESSAGE_READ = 'message:read',
  MESSAGE_SEND = 'message:send',
  MESSAGE_UNPIN = 'message:unpin',

  // Typing Events
  TYPING_START = 'typing:start',
  TYPING_STOP = 'typing:stop',
}