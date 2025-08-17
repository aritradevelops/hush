import { EncryptedMessage } from "@/components/internal/encrypted-message"
import { ShowAttachments } from "@/components/internal/show-attachements"
import { Message } from "@/components/message"
import { useSocket } from "@/contexts/socket-context"
import { useMe } from "@/contexts/user-context"
import httpClient from "@/lib/http-client"
import { formatTime } from "@/lib/time"
import { cn } from "@/lib/utils"
import { ApiListResponseSuccess } from "@/types/api"
import { Chat, ChatMedia, DmDetails, UserChatInteraction, UserChatInteractionStatus } from "@/types/entities"
import { SocketClientEmittedEvent, SocketServerEmittedEvent } from "@/types/events"
import { ReactQueryKeys } from "@/types/react-query"
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import { UUID } from "crypto"
import { Check, CheckCheck, Clock, User, Reply } from "lucide-react"
import { useParams } from "next/navigation"
import { use, useCallback, useEffect, useRef, useState } from "react"
import { useSwipeable } from "react-swipeable"
//! NOTE: per page should be at least a number that overflows the chat body 
//! else the scroll bar won't show and infinite scroll won't work
// TODO: figure out a solution for this
const PER_PAGE = 25

// Add this interface for reply functionality
interface ReplyContext {
  message: Chat & { ucis?: UserChatInteraction[] } & { attachments?: ChatMedia[] };
  onReply: (message: Chat & { ucis?: UserChatInteraction[] } & { attachments?: ChatMedia[] }) => void;
}

export function ChatsBody({ dm, setReplyingTo }: { dm?: DmDetails, setReplyingTo: (replyingTo: Chat | null) => void }) {
  // --- State and refs ---
  const params = useParams();
  const chatId = params.id as UUID;
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const { socket } = useSocket();
  const [isTyping, setIsTyping] = useState(false);
  const queryClient = useQueryClient();

  // Handle reply action
  const handleReply = useCallback((message: Chat & { ucis?: UserChatInteraction[] } & { attachments?: ChatMedia[] }) => {
    setReplyingTo(message);
    // You can add additional logic here like scrolling to input or showing reply UI
  }, []);

  // --- Socket event handlers ---
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
      return await httpClient.getDmChats(chatId as UUID, pageParam, PER_PAGE);
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
  if (!dm || messagesLoading) return <ChatsBodySkeleton />;

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
          return <ChatMessage key={m.id} message={m} dm={dm} onReply={handleReply} />
        })
      }
      {/* <MessageList messages={uniqueMessages} dm={dm} onMarkerRef={el => { newMessagesRef.current = el; }} /> */}
      {/* Warning for non-contact users */}
      {dm && !dm.contact && (
        <div className="sticky top-0 left-0 right-0 z-10 flex justify-center mb-4">
          <Message message="This person is not on your contact list" variant={"warning"} />
        </div>
      )}
    </div>
  );
}

export function ChatMessage({
  message,
  dm,
  onReply
}: {
  message: Chat & { ucis?: UserChatInteraction[] } & { attachments?: ChatMedia[] },
  dm: DmDetails,
  onReply: (message: Chat & { ucis?: UserChatInteraction[] } & { attachments?: ChatMedia[] }) => void
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isSwiped, setIsSwiped] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const isOwnMessage = message.created_by !== dm.chat_user.id;

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if (isOwnMessage) {
        // Own messages can only swipe LEFT (negative deltaX)
        if (eventData.deltaX < 0) {
          const offset = Math.max(eventData.deltaX, -80); // cap at -80px
          setSwipeOffset(offset);
          setIsSwiped(Math.abs(offset) > 20);
        }
      } else {
        // Others’ messages can only swipe RIGHT (positive deltaX)
        if (eventData.deltaX > 0) {
          const offset = Math.min(eventData.deltaX, 80); // cap at +80px
          setSwipeOffset(offset);
          setIsSwiped(offset > 20);
        }
      }
    },
    onSwiped: (eventData) => {
      let validSwipe = false;

      if (isOwnMessage && eventData.deltaX < -40) {
        validSwipe = true;
      } else if (!isOwnMessage && eventData.deltaX > 40) {
        validSwipe = true;
      }

      if (validSwipe) {
        onReply(message);
      }

      // Reset after swipe
      setTimeout(() => {
        setSwipeOffset(0);
        setIsSwiped(false);
      }, 300);
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
    delta: 40,
    swipeDuration: 500,
  });

  return (
    <div
      className={cn(
        "w-full flex items-center gap-2 py-1 cursor-grab relative",
        isOwnMessage ? "justify-end" : "justify-start"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      id={message.id}
      style={{
        transform: `translateX(${swipeOffset}px)`,
        transition: swipeOffset === 0 ? 'transform 0.3s ease-out' : 'none'
      }}
      {...handlers}
    >
      {/* Reply indicator that appears when swiped */}
      {isSwiped && !isOwnMessage && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 flex items-center gap-2 text-white px-3 py-2 rounded-lg shadow-lg">
          <Reply className="w-4 h-4" />
        </div>
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
        {message.reply && <div
          className="w-full p-2 mb-2 flex items-center justify-self-start border-l-2 border-l-blue-700 rounded-lg bg-blue-700/40 cursor-pointer"
          onClick={() => {
            document.getElementById(message.reply?.id as string)?.scrollIntoView({ behavior: 'smooth' })
          }}
        >
          <EncryptedMessage
            channel_id={message.reply.channel_id}
            iv={message.reply.iv}
            message={message.reply.encrypted_message}
          />
        </div>}
        {(message.attachments && !!message.attachments.length) && <ShowAttachments attachments={message.attachments} />}
        <EncryptedMessage
          message={message.encrypted_message}
          iv={message.iv}
          channel_id={message.channel_id}
          className={cn("items-center", isOwnMessage ? "text-secondary-foreground" : "text-primary-foreground")}
        />
        {/* @ts-ignore */}
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
      {/* Reply indicator that appears when swiped */}
      {isSwiped && isOwnMessage && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 flex items-center gap-2 text-white px-3 py-2 rounded-lg shadow-lg">
          <Reply className="w-4 h-4" />
        </div>
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

function ShowStatus({ ucis }: { ucis?: UserChatInteraction[] }) {
  if (!ucis) return <Clock className="w-5 h-4" />
  if (ucis[0].status === UserChatInteractionStatus.SENT) return <Check className="w-5 h-4" />
  if (ucis[0].status === UserChatInteractionStatus.DELIVERED) return <CheckCheck className="w-5 h-4" />
  if (ucis[0].status === UserChatInteractionStatus.SEEN) return <CheckCheck className="w-5 h-4 text-blue-500" />
}