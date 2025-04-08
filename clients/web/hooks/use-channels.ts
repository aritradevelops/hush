// THIS WILL PROBABLY BE A CONTEXT IN LATER VERSIONS

import { useSocket } from "@/contexts/socket-context";
import httpClient from "@/lib/http-client";
import { Chat } from "@/types/entities";
import { SocketServerEmittedEvent } from "@/types/events";
import { ReactQueryKeys } from "@/types/react-query";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UUID } from "crypto";
import { useEffect } from "react";

export function useChannels(filter: 'all' | 'unread' | 'groups', searchQuery: string, activeChatId: UUID | null) {


  const { data: channels, isLoading: isLoadingChannels, isError: isErrorChannels } = useQuery({
    queryKey: [ReactQueryKeys.CHANNEL_OVERVIEW],
    queryFn: () => httpClient.getChannelsOverview(),
    select: (res) => res.data
  })
  const queryClient = useQueryClient()
  let filteredChannels = channels
  const { socket } = useSocket()
  useEffect(() => {
    if (!socket) return
    function onMessage(chat: Chat) {
      if (activeChatId !== chat.channel_id)
        queryClient.invalidateQueries({ queryKey: [ReactQueryKeys.CHANNEL_OVERVIEW] })
    }
    socket.on(SocketServerEmittedEvent.MESSAGE_RECEIVED, onMessage)
    return () => {
      socket.off(SocketServerEmittedEvent.MESSAGE_RECEIVED, onMessage)
    }
  }, [socket])

  // handle filter and search query
  if (filter !== 'all') {
    filteredChannels = channels?.filter(c => {
      if (filter === 'unread') {
        return c.unread_count > 0
      } else if (filter === 'groups') {
        return c.type === 'group'
      }
    })
  }
  if (searchQuery) {
    filteredChannels = channels?.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }
  return {
    isLoading: isLoadingChannels,
    isError: isErrorChannels,
    data: filteredChannels,
  }
}