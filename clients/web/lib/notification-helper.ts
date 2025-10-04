import keysManager from "@/lib/internal/keys-manager";
import { AESGCM } from "./encryption";
import { UUID } from "crypto";
import { ChannelType, Chat, User, UserChatInteraction } from "@/types/entities";
import httpClient from "./http-client";

export function playSound(src: string) {
  const audio = new Audio(src);
  audio.play().catch((e) => console.debug("Sound play error:", e));
}

export function isTabInactive() {
  return document.hidden;
}

export function sendPushNotification(title: string, body: string) {
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification(title, { body });
      }
    });
  }
}

export async function decryptMessage({
  user,
  message,
}: {
  message: Chat & { ucis: UserChatInteraction[] };
  user: User;
}) {
  const sharedSecret = await keysManager.getSharedSecret(
    message.channel_id,
    user.email
  );
  // console.debug(Base64Utils.encode(sharedSecret), iv)

  const decryptedMessage = await AESGCM.decrypt(
    message.encrypted_message,
    message.iv,
    sharedSecret
  );
  return decryptedMessage;
}

export async function getNotificationContent({
  message,
  user,
}: {
  message: Chat & { ucis: UserChatInteraction[] };
  user: User;
}): Promise<{
  senderName: string;
  decryptedMessage: string;
  type: ChannelType;
  unreadCount: number;
  channelName: string;
}> {
  const decryptedMessage = await decryptMessage({ message, user });
  const channelInfo = await httpClient.getChannelOverview(message.channel_id);
  // Get sender name from channel overview
  const channelData = Array.isArray(channelInfo?.data)
    ? channelInfo.data[0]
    : channelInfo?.data;
  const senderName = channelData.last_chat?.sender_name ?? "Unknown";
  const channelName = channelData.name;

  const type = channelData.type ?? "dm";
  const unreadCount = channelData.unread_count;

  if (type === "group") {
    console.log(channelData, "sending notif dmdetails");
  }

  return {
    senderName,
    channelName,
    decryptedMessage,
    unreadCount,
    type,
  };
}
