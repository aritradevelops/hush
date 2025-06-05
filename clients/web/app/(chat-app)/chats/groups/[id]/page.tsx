'use client'
import httpClient from "@/lib/http-client";
import { cn } from "@/lib/utils";
import { Chat, GroupDetails, UserChatInteraction, UserChatInteractionStatus } from "@/types/entities";
import { ReactQueryKeys } from "@/types/react-query";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { UUID } from "crypto";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Dropzone from 'react-dropzone';
import { GroupChatHeader } from "./components/group-chat-header";
import { GroupChatInput } from "./components/group-chat-input";
import { useSocket } from "@/contexts/socket-context";
import { ApiListResponseSuccess } from "@/types/api";
import { useMe } from "@/contexts/user-context";
import { SocketServerEmittedEvent } from "@/types/events";
import { EncryptedMessage } from "@/components/internal/encrypted-message";
import { formatTime } from "@/lib/time";
import { Check, CheckCheck, Clock, User } from "lucide-react";
//! NOTE: per page should be at least a number that overflows the chat body 
//! else the scroll bar won't show and infinite scroll won't work
// TODO: figure out a solution for this
const PER_PAGE = 25
export default function GroupChatPage() {
  const params = useParams();
  const chatId = params.id as string;
  const { data: group, isLoading: groupLoading } = useQuery({
    queryKey: [ReactQueryKeys.GROUP_DETAILS, chatId],
    queryFn: () => httpClient.getGroupDetails(chatId as UUID),
    select: (data) => data.data,
  });
  const [files, setFiles] = React.useState<File[]>([])
  const [isDragging, setIsDragging] = React.useState(false)
  const handleDrop = (acceptedFiles: File[]) => {
    console.log('Accepted files:', acceptedFiles);
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
    setIsDragging(false)
  };

  if (!groupLoading && !group) {
    return (
      <div className="flex-1 flex flex-col h-full">
        <div className="text-center text-muted-foreground h-full flex items-center justify-center">
          Group not found
        </div>
      </div>
    );
  }

  return (
    <Dropzone onDrop={handleDrop} onDragEnter={() => setIsDragging(true)} onDragLeave={() => setIsDragging(false)} multiple>
      {({ getRootProps, getInputProps }) => (
        <div
          {...getRootProps()}
          className={cn(
            "flex-1 flex flex-col h-full relative",
            isDragging ? "after:absolute after:inset-0 after:bg-primary/10 after:border-2 after:border-dashed after:border-primary after:rounded-md after:pointer-events-none after:z-10" : ""
          )}
        >
          <GroupChatHeader group={group} />
          {group && (
            files.length > 0 ? (
              <FilesPreview files={files} group={group} />
            ) : (
              <GroupChatBody group={group} />
            )
          )}
          <input {...getInputProps()} />
          {/* {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <div className="bg-background p-4 rounded-lg shadow-lg border border-primary">
                <p className="text-lg font-medium text-primary">Drop files here</p>
              </div>
            </div>
          )} */}
          <GroupChatInput group={group} files={files} />
        </div>
      )}
    </Dropzone>
  );
}



export function GroupChatBody({ group }: { group?: GroupDetails }) {
  if (!group) {
    return <ChatBodySkeleton />
  }
  const chatId = group.id;
  const [isTyping, setIsTyping] = React.useState(false);
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const { user } = useMe();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  useEffect(() => {
    if (!socket) return
    function onTypingStart({ channel_id, user_id }: { channel_id: UUID, user_id: UUID }) {
      console.log('Typing start');
      if (channel_id !== chatId) return
      console.log('here')
      setIsTyping(true)
    }
    function onTypingStop({ channel_id, user_id }: { channel_id: UUID, user_id: UUID }) {
      console.log('Typing stop');
      if (channel_id !== chatId) return
      console.log('here2')
      setIsTyping(false)
    }
    function updateMessageStatus(message: Chat, status: UserChatInteractionStatus) {
      queryClient.setQueryData([ReactQueryKeys.DIRECT_MESSAGES_CHATS, message.channel_id],
        (oldData: { pages: ApiListResponseSuccess<Chat & { status: UserChatInteractionStatus }>[], pageParams: number[] }) => {
          if (!oldData) {
            // If there's no old data, return the message as is
            return {
              pages: [{ data: [message], nextPage: null, total: 1 }],
              pageParams: []
            };
          }
          // Find the message in the first page
          const messageIndex = oldData.pages[0].data.findIndex(m => m.id === message.id);
          if (messageIndex === -1) return oldData;

          // Create a new array with the updated message
          const updatedMessages = [...oldData.pages[0].data];
          updatedMessages[messageIndex] = {
            ...updatedMessages[messageIndex],
            // only update the status from low to high, not the other way
            status: Math.max(updatedMessages[messageIndex].status, status)
          };

          // Return new reference for the entire structure
          return {
            pages: [{ ...oldData.pages[0], data: updatedMessages }],
            pageParams: oldData.pageParams
          }
        }
      );
    }

    function onMessage(message: Chat, cb: ({ status }: { status: UserChatInteractionStatus }) => void) {
      console.log('new message received', message, message.channel_id, chatId)
      // if the message was sent by me then mark it as sent
      if (message.created_by === user.id) {
        updateMessageStatus(message, UserChatInteractionStatus.SENT)
      } else {
        // if the message was not part of active chat then mark it as delivered
        if (message.channel_id !== chatId) {
          cb({ status: UserChatInteractionStatus.DELIVERED })
        } else {
          cb({ status: UserChatInteractionStatus.SEEN })
          // append the message to the body and mark it as seen
          queryClient.setQueryData([ReactQueryKeys.DIRECT_MESSAGES_CHATS, message.channel_id],
            (oldData: { pages: ApiListResponseSuccess<Chat & { status: UserChatInteractionStatus }>[], pageParams: number[] }) => {
              // update the message in the cache
              return {
                pages: [{ ...oldData.pages[0], data: [message, ...oldData.pages[0].data] }],
                pageParams: oldData.pageParams
              }
            }
          );
        }
      }
    }
    function onMessageDelivered(message: Chat) {
      if (message.channel_id !== chatId || message.created_by !== user.id) return
      updateMessageStatus(message, UserChatInteractionStatus.DELIVERED)
    }
    function onMessageSeen(message: Chat) {
      if (message.channel_id !== chatId || message.created_by !== user.id) return
      updateMessageStatus(message, UserChatInteractionStatus.SEEN)
    }
    socket.on(SocketServerEmittedEvent.TYPING_START, onTypingStart)
    socket.on(SocketServerEmittedEvent.TYPING_STOP, onTypingStop)
    socket.on(SocketServerEmittedEvent.MESSAGE_RECEIVED, onMessage)
    socket.on(SocketServerEmittedEvent.MESSAGE_DELIVERED, onMessageDelivered)
    socket.on(SocketServerEmittedEvent.MESSAGE_SEEN, onMessageSeen)
    return () => {
      socket.off(SocketServerEmittedEvent.TYPING_START, onTypingStart)
      socket.off(SocketServerEmittedEvent.TYPING_STOP, onTypingStop)
      socket.off(SocketServerEmittedEvent.MESSAGE_RECEIVED, onMessage)
      socket.on(SocketServerEmittedEvent.MESSAGE_RECEIVED, onMessage)
      socket.off(SocketServerEmittedEvent.MESSAGE_DELIVERED, onMessageDelivered)
      socket.off(SocketServerEmittedEvent.MESSAGE_SEEN, onMessageSeen)
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
  console.log('re-rendering', uniqueMessages)

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
      {/* <MessageList messages={uniqueMessages} dm={dm} onMarkerRef={el => { newMessagesRef.current = el; }} /> */}
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

export function FilesPreview({ files, group }: { files: File[], group: GroupDetails }) {
  const [showAll, setShowAll] = React.useState(false);
  const maxPreviewFiles = 3;

  const handleRemoveFile = (indexToRemove: number) => {
    // This function would need to communicate with the parent component
    // For now, we'll just log it
    console.log('Remove file at index:', indexToRemove);
  };

  const getFilePreview = (file: File) => {
    const fileType = file.type.split('/')[0];

    if (fileType === 'image') {
      return (
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          className="w-48 h-48 object-cover rounded"
        />
      );
    } else if (fileType === 'video') {
      return (
        <div className="w-48 h-48 bg-black flex items-center justify-center rounded">
          <svg className="w-12 h-12 text-white" viewBox="0 0 24 24">
            <path fill="currentColor" d="M8 5v14l11-7z" />
          </svg>
        </div>
      );
    } else if (file.type === 'application/pdf') {
      return (
        <div className="w-48 h-48 bg-red-100 flex items-center justify-center rounded">
          <svg className="w-12 h-12 text-red-500" viewBox="0 0 24 24">
            <path fill="currentColor" d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm12 6V9c0-.55-.45-1-1-1h-2v5h2c.55 0 1-.45 1-1zm-2-3h1v3h-1V9z" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded">
          <svg className="w-12 h-12 text-gray-500" viewBox="0 0 24 24">
            <path fill="currentColor" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
          </svg>
        </div>
      );
    }
  };

  // File size formatter
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const visibleFiles = showAll ? files : files.slice(0, maxPreviewFiles);
  const hiddenFilesCount = files.length - maxPreviewFiles;

  return (
    <div className="flex-1 overflow-y-auto bg-background border-t border-border p-4">
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-4">Attachments ({files.length})</h3>
        <div className="flex flex-wrap gap-4">
          {visibleFiles.map((file, index) => (
            <div key={index} className="relative group">
              <div className="relative overflow-hidden rounded border border-border">
                {getFilePreview(file)}
              </div>
              <button
                onClick={() => handleRemoveFile(index)}
                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
              <div className="mt-1 text-sm text-muted-foreground w-48 truncate">
                {file.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </div>
            </div>
          ))}

          {!showAll && hiddenFilesCount > 0 && (
            <div
              className="bg-muted flex items-center justify-center rounded cursor-pointer border border-border"
              onClick={() => setShowAll(true)}
            >
              <span className="text-sm font-medium">+{hiddenFilesCount} more</span>
            </div>
          )}
        </div>

        {showAll && files.length > maxPreviewFiles && (
          <button
            className="text-xs text-primary mt-2"
            onClick={() => setShowAll(false)}
          >
            Show less
          </button>
        )}
      </div>
    </div>
  );
}
export function ChatMessage({
  message,
  group
}: {
  message: Chat & { ucis?: UserChatInteraction[] },
  group: GroupDetails
}) {
  const { user } = useMe();
  const [isHovered, setIsHovered] = useState(false);
  const isOwnMessage = message.created_by === user.id;

  return (
    <div
      className={cn(
        "w-full flex items-center gap-2 py-1",
        isOwnMessage ? "justify-end" : "justify-start"
      )}
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

      {/* Message bubble */}
      <div
        className={cn(
          "max-w-2xl rounded-2xl px-4 py-2 shadow-sm flex-col",
          isOwnMessage
            ? "bg-secondary text-secondary-foreground rounded-tr-none"
            : "bg-primary text-primary-foreground rounded-tl-none"
        )}
      >
        <EncryptedMessage
          message={message.encrypted_message}
          iv={message.iv}
          channel_id={message.channel_id}
          className={cn("items-center", isOwnMessage ? "text-secondary-foreground" : "text-primary-foreground")}
        />
        {/* @ts-ignore */}
        {<span className="flex justify-self-end">
          <span className="text-xs text-muted-foreground opacity-80 self-center min-w-16 text-left">
            {formatTime(message.created_at)}
          </span>
          {isOwnMessage && <ShowStatus ucis={message.ucis} />}
        </span>}
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