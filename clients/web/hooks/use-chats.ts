// THIS WILL PROBABLY BE A CONTEXT IN LATER VERSIONS

import { useSocket } from "@/contexts/socket-context";
import httpClient from "@/lib/http-client";
import { ChannelType, ChannelWithLastChat, Chat, DirectMessageWithLastChat, GroupMember, GroupWithLastChat } from "@/types/entities";
import { SocketServerEmittedEvent } from "@/types/events";
import { ReactQueryKeys } from "@/types/react-query";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UUID } from "crypto";
import { useEffect } from "react";

export function useChats(filter: 'all' | 'unread' | 'groups', searchQuery: string) {
  const { data: directMessages, isLoading: isLoadingDirectMessages, isError: isErrorDirectMessages } = useQuery({
    queryKey: [ReactQueryKeys.DIRECT_MESSAGES],
    queryFn: () => httpClient.listDirectMessagesWithLastChat(),
    select: (res) => res.data
  })
  const { data: groups, isLoading: isLoadingGroups, isError: isErrorGroups } = useQuery({
    queryKey: [ReactQueryKeys.GROUPS],
    queryFn: () => httpClient.listGroupsWithLastChat(),
    select: (res) => res.data
  })

  const { data: groupMembers, isLoading: isLoadingGroupMembers, isError: isErrorGroupMembers } = useQuery({
    queryKey: [ReactQueryKeys.GROUP_MEMBERS],
    queryFn: () => httpClient.listGroupMembers(),
    select: (res) => res.data,
  })
  const queryClient = useQueryClient()

  const { socket } = useSocket()
  useEffect(() => {
    if (!socket) return
    function onMessage(_: Chat) {
      queryClient.invalidateQueries({ queryKey: [ReactQueryKeys.DIRECT_MESSAGES] })
      queryClient.invalidateQueries({ queryKey: [ReactQueryKeys.GROUPS] })
      queryClient.invalidateQueries({ queryKey: [ReactQueryKeys.GROUP_MEMBERS] })
    }
    socket.on(SocketServerEmittedEvent.MESSAGE_RECEIVED, onMessage)
    return () => {
      socket.off(SocketServerEmittedEvent.MESSAGE_RECEIVED, onMessage)
    }
  }, [socket])

  const groupMemberMap = groupMembers ? groupMembers.reduce((final, curr) => {
    final[curr.channel_id] = curr
    return final
  }, {} as Record<UUID, GroupMember>) : {}

  let data = (directMessages && groups)
    ? mergeChannelsByCreatedAt(directMessages, groups).map(c => {
      if (c.type === ChannelType.DIRECT_MESSAGE) {
        return {
          id: c.id,
          // TODO: may be show name of the user
          name: c.contact?.name || c.chat_user.name,
          avatar: c.chat_user.avatar,
          type: ChannelType.DIRECT_MESSAGE,
          unreadCount: 0,
          isPinned: !!c.contact?.is_pinned,
          isMuted: !!c.contact?.is_muted,
          isBlocked: !!c.contact?.is_blocked,
          // TODO: add last chat
          lastChat: c.last_chat
        }
      } else {
        return {
          id: c.id,
          name: c.name,
          avatar: c.image,
          type: ChannelType.GROUP,
          unreadCount: 0,
          isPinned: !!groupMemberMap[c.id]?.has_pinned,
          isMuted: !!groupMemberMap[c.id]?.has_muted,
          joinedAt: groupMemberMap[c.id]?.created_at,
          leftAt: groupMemberMap[c.id]?.deleted_at,
          lastChat: c.last_chat
        }
      }
    })
    : undefined

  // handle filter and search query
  if (filter !== 'all') {
    data = data?.filter(c => {
      if (filter === 'unread') {
        return c.unreadCount > 0
      } else if (filter === 'groups') {
        return c.type === 'group'
      }
    })
  }

  if (searchQuery) {
    data = data?.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }

  return {
    isLoading: isLoadingDirectMessages || isLoadingGroups || isLoadingGroupMembers,
    isError: isErrorDirectMessages || isErrorGroups || isErrorGroupMembers,
    data,
  }

}

function mergeChannelsByCreatedAt(directMessages: DirectMessageWithLastChat[], groups: GroupWithLastChat[]) {
  const channels: ChannelWithLastChat[] = []
  let i = 0, j = 0
  while (i < directMessages.length && j < groups.length) {
    if (directMessages[i].created_at < groups[j].created_at) {
      channels.push({ ...directMessages[i], type: ChannelType.DIRECT_MESSAGE })
      i++
    } else {
      channels.push({ ...groups[j], type: ChannelType.GROUP })
      j++
    }
  }
  while (i < directMessages.length) {
    channels.push({ ...directMessages[i], type: ChannelType.DIRECT_MESSAGE })
    i++
  }
  while (j < groups.length) {
    channels.push({ ...groups[j], type: ChannelType.GROUP })
    j++
  }
  return channels
}