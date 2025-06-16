// Channel
export var ChannelType;
(function (ChannelType) {
    ChannelType["DIRECT_MESSAGE"] = "dm";
    ChannelType["GROUP"] = "group";
})(ChannelType || (ChannelType = {}));
export var UserChatInteractionStatus;
(function (UserChatInteractionStatus) {
    // -1 is not part of the server status but it is kept for the client to show that the message is being sent
    UserChatInteractionStatus[UserChatInteractionStatus["SENDING"] = -1] = "SENDING";
    UserChatInteractionStatus[UserChatInteractionStatus["SENT"] = 0] = "SENT";
    UserChatInteractionStatus[UserChatInteractionStatus["DELIVERED"] = 1] = "DELIVERED";
    UserChatInteractionStatus[UserChatInteractionStatus["SEEN"] = 2] = "SEEN";
})(UserChatInteractionStatus || (UserChatInteractionStatus = {}));
export var ChatMediaStatus;
(function (ChatMediaStatus) {
    ChatMediaStatus[ChatMediaStatus["INITIALIZED"] = 1] = "INITIALIZED";
    ChatMediaStatus[ChatMediaStatus["UPLOADED"] = 2] = "UPLOADED";
})(ChatMediaStatus || (ChatMediaStatus = {}));
