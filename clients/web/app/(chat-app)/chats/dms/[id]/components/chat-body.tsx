import { EncryptedMessage } from "@/components/internal/encrypted-message"
import { Message } from "@/components/message"
import { useSocket } from "@/contexts/socket-context"
import httpClient from "@/lib/http-client-old"
import { formatTime } from "@/lib/time"
import { cn } from "@/lib/utils"
import { ApiListResponseSuccess } from "@/types/api"
import { Chat, Contact, DirectMessage, User } from "@/types/entities"
import { SocketServerEmittedEvent } from "@/types/events"
import { ReactQueryKeys } from "@/types/react-query"
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import { UUID } from "crypto"
import { useParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
//! NOTE: per page should be at least a number that overflows the chat body 
//! else the scroll bar won't show and infinite scroll won't work
// TODO: figure out a solution for this
const PER_PAGE = 25
export function ChatsBody({ dm }: { dm?: DirectMessage & { contact: Contact | null } & { chat_user: User } }) {
  const params = useParams()
  const chatId = params.id as string
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [initialScrollDone, setInitialScrollDone] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const { socket } = useSocket()
  const [isTyping, setIsTyping] = useState(false)
  const queryClient = useQueryClient()
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
    function onMessage(message: Chat) {
      if (message.channel_id !== chatId) return
      queryClient.setQueryData([ReactQueryKeys.DIRECT_MESSAGES_CHATS, message.channel_id],
        (oldData: { pages: ApiListResponseSuccess<Chat>[], pageParams: number[] }) => {
          return {
            pages: [{ ...oldData.pages[0], data: [message, ...oldData.pages[0].data] }],
            pageParams: oldData.pageParams
          }
        }
      );
    }
    socket.on(SocketServerEmittedEvent.TYPING_START, onTypingStart)
    socket.on(SocketServerEmittedEvent.TYPING_STOP, onTypingStop)
    socket.on(SocketServerEmittedEvent.MESSAGE_RECEIVED, onMessage)
    return () => {
      socket.off(SocketServerEmittedEvent.TYPING_START, onTypingStart)
      socket.off(SocketServerEmittedEvent.TYPING_STOP, onTypingStop)
      socket.off(SocketServerEmittedEvent.MESSAGE_RECEIVED, onMessage)
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
      return await httpClient.listMessages(chatId as UUID, PER_PAGE, pageParam);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // If we received messages, there might be more pages
      return lastPage.info.total > lastPage.info.per_page * lastPage.info.page ? lastPage.info.page + 1 : undefined;
    },
    enabled: !!dm
  })

  // Combine all messages from all pages
  const allMessages = data?.pages.flatMap(page => page.data) || [];
  const uniqueMessages = Array.from(
    allMessages.reduce((map, message) => {
      map.set(message.id, message);
      return map;
    }, new Map()).values()
  );

  // Function to scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Handle scroll event to detect when user reaches the top
  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current || !hasNextPage || isFetchingNextPage) return;

    const { scrollTop } = chatContainerRef.current;

    // Load more messages when user scrolls near the top (20px threshold)
    if (scrollTop < 20) {
      setLoadingMore(true);
      fetchNextPage().finally(() => {
        setLoadingMore(false);
      });
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Attach scroll listener and handle initial scroll
  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);

      // Initial scroll to bottom when messages first load
      if (!initialScrollDone && allMessages.length > 0 && !messagesLoading) {
        scrollToBottom();
        setInitialScrollDone(true);
      }
    }

    return () => {
      container?.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, allMessages, initialScrollDone, messagesLoading, scrollToBottom]);

  // If no messages data is available yet, show skeleton
  if (!dm || messagesLoading) return <ChatsBodySkeleton />;

  return (
    <div
      ref={chatContainerRef}
      className="flex-1 overflow-y-auto p-4 flex flex-col-reverse gap-2 relative"
    >
      {/* Loading indicator at the top when loading more messages */}
      {loadingMore && (
        <div className="sticky top-0 w-full flex justify-center py-2 z-10">
          <div className="bg-primary/20 text-primary px-4 py-2 rounded-full text-sm flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            Loading older messages...
          </div>
        </div>
      )}
      {/* Invisible element to scroll to */}
      <div ref={messagesEndRef} />
      {isTyping && (
        <div className="relative max-w-xl rounded-2xl px-4 py-2 shadow-sm bg-primary text-primary-foreground rounded-tl-none">
          Typing...
        </div>
      )}

      {/* Render all messages */}
      {uniqueMessages.map((message) => (
        <ChatMessage key={message.id} message={message} dm={dm} />
      ))}

      {/* Warning for non-contact users */}
      {dm && !dm.contact && (
        <div className="sticky top-0 left-0 right-0 z-10 flex justify-center mb-4">
          <Message message="This person is not on your contact list" variant={"warning"} />
        </div>
      )}
    </div>
  )
}

export function ChatMessage({
  message,
  dm
}: {
  message: Chat,
  dm: DirectMessage & { contact: Contact | null } & { chat_user: User }
}) {
  const [isHovered, setIsHovered] = useState(false);
  const isOwnMessage = message.created_by !== dm.chat_user.id;

  return (
    <div
      className={cn(
        "w-full flex items-center gap-2 py-1",
        isOwnMessage ? "justify-end" : "justify-start"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
          "relative max-w-2xl rounded-2xl px-4 py-2 shadow-sm",
          isOwnMessage
            ? "bg-secondary text-secondary-foreground rounded-tr-none"
            : "bg-primary text-primary-foreground rounded-tl-none"
        )}
      >
        <EncryptedMessage
          message={message.message}
          iv={message.iv}
          channel_id={message.channel_id}
          className={cn("items-center", isOwnMessage ? "text-secondary-foreground" : "text-primary-foreground")}
        />
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


export function ChatsBodySkeleton() {
  // Create multiple skeleton messages with varying widths for a more realistic look
  const skeletonMessages = [
    { id: 1, isOwnMessage: false, width: "w-3/4" },
    { id: 2, isOwnMessage: true, width: "w-1/2" },
    { id: 3, isOwnMessage: false, width: "w-2/3" },
    { id: 4, isOwnMessage: true, width: "w-2/5" },
    { id: 5, isOwnMessage: false, width: "w-3/5" },
    { id: 6, isOwnMessage: false, width: "w-3/5" },
    { id: 7, isOwnMessage: true, width: "w-2/5" },
    { id: 8, isOwnMessage: false, width: "w-2/3" },
    { id: 9, isOwnMessage: true, width: "w-1/2" },
  ]

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse gap-3 relative">
      {skeletonMessages.map((skeleton) => (
        <div
          key={skeleton.id}
          className={cn(
            "w-full flex items-center gap-2 py-1",
            skeleton.isOwnMessage ? "justify-end" : "justify-start"
          )}
        >
          {/* Message bubble skeleton */}
          <div
            className={cn(
              "relative rounded-2xl h-12 px-4 py-2 shadow-sm animate-pulse",
              skeleton.width,
              skeleton.isOwnMessage
                ? "bg-secondary/80 text-secondary-foreground rounded-tr-none"
                : "bg-primary/20 text-primary-foreground rounded-tl-none"
            )}
          >
          </div>
        </div>
      ))}
    </div>
  )
}