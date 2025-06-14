// THIS WILL PROBABLY BE A CONTEXT IN LATER VERSIONS

import { useSocket } from "@/contexts/socket-context";
import httpClient from "@/lib/http-client";
import { Chat, UserChatInteractionStatus } from "@/types/entities";
import { SocketServerEmittedEvent } from "@/types/events";
import { ReactQueryKeys } from "@/types/react-query";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UUID } from "crypto";
import { use, useEffect } from "react";

export function useChannels(filter: 'all' | 'unread' | 'groups', searchQuery: string, activeChatId: UUID | null) {


  const { data: channels, isLoading: isLoadingChannels, isError: isErrorChannels } = useQuery({
    queryKey: [ReactQueryKeys.CHANNEL_OVERVIEW],
    queryFn: () => httpClient.getChannelsOverview(),
    select: (res) => res.data
  })
  const queryClient = useQueryClient()
  let filteredChannels = channels
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: [ReactQueryKeys.CHANNEL_OVERVIEW] })
  }, [activeChatId])

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
