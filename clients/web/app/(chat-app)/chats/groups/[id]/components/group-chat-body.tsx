'use client'
import { EncryptedMessage } from "@/components/internal/encrypted-message";
import { ShowAttachments } from "@/components/internal/show-attachements";
import { useSocket } from "@/contexts/socket-context";
import { useMe } from "@/contexts/user-context";
import { Base64Utils } from "@/lib/base64";
import httpClient from "@/lib/http-client";
import keysManager from "@/lib/internal/keys-manager";
import { formatTime } from "@/lib/time";
import { cn } from "@/lib/utils";
import { ApiListResponseSuccess } from "@/types/api";
import { Chat, ChatMedia, ChatMediaStatus, GroupDetails, UserChatInteraction, UserChatInteractionStatus } from "@/types/entities";
import { SocketServerEmittedEvent } from "@/types/events";
import { ReactQueryKeys } from "@/types/react-query";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { UUID } from "crypto";
import { Check, CheckCheck, Clock } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from 'react';
const PER_PAGE = 25

export function GroupChatBody({ group }: { group?: GroupDetails }) {
  const params = useParams();
  const chatId = params.id as UUID;
  const [isTyping, setIsTyping] = React.useState(false);
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  useEffect(() => {
    if (!socket) return
    function onTypingStart({ channel_id, user_id }: { channel_id: UUID, user_id: UUID }) {
      console.debug('Typing start');
      if (channel_id !== chatId) return
      console.debug('here')
      setIsTyping(true)
    }
    function onTypingStop({ channel_id, user_id }: { channel_id: UUID, user_id: UUID }) {
      console.debug('Typing stop');
      if (channel_id !== chatId) return
      console.debug('here2')
      setIsTyping(false)
    }
    socket.on(SocketServerEmittedEvent.TYPING_START, onTypingStart)
    socket.on(SocketServerEmittedEvent.TYPING_STOP, onTypingStop)
    return () => {
      socket.off(SocketServerEmittedEvent.TYPING_START, onTypingStart)
      socket.off(SocketServerEmittedEvent.TYPING_STOP, onTypingStop)
    }
  }, [socket, isTyping, queryClient])

  // Use infinite query to fetch paginated messages
  const {
    data,
    isLoading: messagesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: [ReactQueryKeys.DIRECT_MESSAGES_CHATS, chatId],
    queryFn: async ({ pageParam = 1 }) => {
      return await httpClient.getGroupChats(chatId as UUID, pageParam, PER_PAGE);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // If we received messages, there might be more pages
      return lastPage.info.total > lastPage.info.per_page * lastPage.info.page ? lastPage.info.page + 1 : undefined;
    },
    enabled: !!group
  })

  // Combine all messages from all pages
  const allMessages = data?.pages.flatMap(page => page.data) || [];
  const uniqueMessages = Array.from(
    allMessages.reduce((map, message) => {
      map.set(message.id, message);
      return map;
    }, new Map()).values()
  );

  // --- Scroll and pagination ---
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current || !hasNextPage || isFetchingNextPage) return;
    const { scrollTop } = chatContainerRef.current;
    if (scrollTop < 20) {
      setLoadingMore(true);
      fetchNextPage().finally(() => setLoadingMore(false));
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      if (!initialScrollDone && allMessages.length > 0 && !messagesLoading) {
        scrollToBottom();
        setInitialScrollDone(true);
      }
    }
    return () => {
      container?.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, allMessages, initialScrollDone, messagesLoading, scrollToBottom]);
  if (!group) {
    return <ChatBodySkeleton />
  }
  return (
    <div
      ref={chatContainerRef}
      className="flex-1 overflow-y-auto p-4 flex flex-col-reverse gap-2 relative"
    >
      {loadingMore && (
        <div className="sticky top-0 w-full flex justify-center py-2 z-10">
          <div className="bg-primary/20 text-primary px-4 py-2 rounded-full text-sm flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            Loading older messages...
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
      {isTyping && (
        <div className="relative max-w-xl rounded-2xl px-4 py-2 shadow-sm bg-primary text-primary-foreground rounded-tl-none">
          Typing...
        </div>
      )}
      {
        uniqueMessages.map(m => {
          return <ChatMessage key={m.id} message={m} group={group} />
        })
      }
    </div>
  )
}
export function ChatBodySkeleton() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold animate-pulse bg-accent h-6 w-32 rounded" />
        {/* Add your message rendering logic here */}
      </div>
    </div>
  )
}
export function ChatMessage({
  message,
  group
}: {
  message: Chat & { ucis?: UserChatInteraction[] } & { attachments?: ChatMedia[] },
  group: GroupDetails
}) {
  const { user } = useMe();
  const [isHovered, setIsHovered] = useState(false);
  const isOwnMessage = message.created_by === user.id;

  return (
    <div
      className={cn(
        "w-full flex items-start gap-2 py-1",
        isOwnMessage ? "justify-end" : "justify-start"
      )}
      data-owner={isOwnMessage}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      id={message.id}
    >
      {/* Timestamp for sent messages (appears on the left of own messages) */}
      {isOwnMessage && isHovered && (
        <span className="text-xs text-muted-foreground opacity-80 self-center min-w-16 text-right">
          {formatTime(message.created_at)}
        </span>
      )}
      {!isOwnMessage && <div>
        {/* show the name of the sender */}
        <img
          src={group.group_members.find(m => m.user_id === message.created_by)?.user.dp || `https://api.dicebear.com/7.x/avataaars/svg?seed=${group.group_members.find(m => m.user_id === message.created_by)?.user.name}`}
          alt={group.group_members.find(m => m.user_id === message.created_by)?.user.name}
          className="w-12 h-12 rounded-full"
        />

      </div>}

      {/* Message bubble */}
      <div
        className={cn(
          "max-w-2xl rounded-2xl px-4 py-2 shadow-sm flex-col",
          isOwnMessage
            ? "bg-secondary text-secondary-foreground rounded-tr-none"
            : "bg-primary text-primary-foreground rounded-tl-none"
        )}
      >
        {/* Sender name above message for received messages */}
        {!isOwnMessage && (
          <span className="text-xs font-semibold text-primary-foreground block">
            {group.group_members.find(m => m.user_id === message.created_by)?.user.name}
          </span>
        )}
        {(message.attachments && !!message.attachments.length) && <ShowAttachments attachments={message.attachments} />}
        <EncryptedMessage
          message={message.encrypted_message}
          iv={message.iv}
          channel_id={message.channel_id}
          className={cn("items-center", isOwnMessage ? "text-secondary-foreground" : "text-primary-foreground")}
        />
        <span
          className={cn(
            "flex w-full mt-1",
            isOwnMessage ? "justify-end" : "justify-start"
          )}
        >
          <span className="text-xs text-muted-foreground opacity-80 self-center min-w-16">
            {formatTime(message.created_at)}
          </span>
          {isOwnMessage && <ShowStatus ucis={message.ucis} />}
        </span>
      </div>

      {/* Timestamp for received messages (appears on the right of others' messages) */}
      {!isOwnMessage && isHovered && (
        <span className="text-xs text-muted-foreground opacity-80 self-center min-w-16 text-left">
          {formatTime(message.created_at)}
        </span>
      )}
    </div>
  );
}
function ShowStatus({ ucis }: { ucis?: UserChatInteraction[] }) {
  if (!ucis) return <Clock className="w-5 h-4" />
  if (ucis.every((uci) => uci.status === UserChatInteractionStatus.SEEN)) return <CheckCheck className="w-5 h-4 text-blue-500" />
  if (ucis.every(uci => uci.status === UserChatInteractionStatus.DELIVERED || UserChatInteractionStatus.SEEN)) return <CheckCheck className="w-5 h-4" />
  return <Check className="w-5 h-4" />
}


