import { useSocket } from "@/contexts/socket-context";
import { playSound } from "@/lib/notification-helper";
import { UserChatInteraction } from "@/types/entities";
import { SocketServerEmittedEvent } from "@/types/events";
import { UUID } from "crypto";
import { useEffect, useRef, useCallback } from "react";

type PushNotification = {
  title: string;
  description: string;
  unreadCount?: number;
};

type NotificationParams = {
  soundPath: string;
  notification?: PushNotification;
  groupBy?: string;
};

const DEBOUNCE_DELAY = 500;

export function useNotification() {
  const { socket } = useSocket();

  const debounceTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  const latestNotificationRef = useRef<Map<string, PushNotification>>(
    new Map()
  );

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission !== "granted" &&
      !localStorage.getItem("askedForNotification")
    ) {
      Notification.requestPermission().then(() => {
        localStorage.setItem("askedForNotification", "true");
      });
    }
  }, []);

  const notify = useCallback(
    ({ soundPath, notification, groupBy }: NotificationParams) => {
      if (soundPath && (!notification || !groupBy)) {
        playSound(soundPath);
        return;
      }
      if (!notification || !groupBy) {
        return;
      }

      latestNotificationRef.current.set(groupBy, notification);

      const existingTimer = debounceTimersRef.current.get(groupBy);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const timer = setTimeout(() => {
        const latest = latestNotificationRef.current.get(groupBy);

        if (latest && latest.unreadCount) {
          let description = latest.description;
          if (latest.unreadCount > 1) {
            description = `${latest.description} +${
              latest.unreadCount - 1
            } more message${latest.unreadCount - 1 > 1 ? "s" : ""}`;
          }

          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification(latest.title, { body: description });
          }

          if (soundPath) {
            const audio = new Audio(soundPath);
            audio.play();
          }

          debounceTimersRef.current.delete(groupBy);
        }
      }, DEBOUNCE_DELAY);

      debounceTimersRef.current.set(groupBy, timer);
    },
    []
  );

  const onMessageSeen = useCallback(
    (payload: UserChatInteraction & { chat_id: UUID }) => {
      // TODO: make this more generic (bound to channel_id)
      const groupBy = payload.channel_id;

      // Clear debounce timer
      const timer = debounceTimersRef.current.get(groupBy);
      if (timer) {
        clearTimeout(timer);
        debounceTimersRef.current.delete(groupBy);
      }
    },
    []
  );

  useEffect(() => {
    if (!socket) return;

    socket.on(SocketServerEmittedEvent.MESSAGE_SEEN, onMessageSeen);

    return () => {
      socket.off(SocketServerEmittedEvent.MESSAGE_SEEN, onMessageSeen);
    };
  }, [socket, onMessageSeen]);

  return notify;
}
