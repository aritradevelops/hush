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
import { GroupChatBody } from "./components/group-chat-body";
import { Attachments } from "@/components/internal/attachements";
import { FilesPreview } from "@/components/internal/file-preview";
//! NOTE: per page should be at least a number that overflows the chat body 
//! else the scroll bar won't show and infinite scroll won't work
// TODO: figure out a solution for this
export default function GroupChatPage() {
  const params = useParams();
  const chatId = params.id as UUID;
  const { data: group, isLoading: groupLoading } = useQuery({
    queryKey: [ReactQueryKeys.GROUP_DETAILS, chatId],
    queryFn: () => httpClient.getGroupDetails(chatId as UUID),
    select: (data) => data.data,
  });

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
    <Attachments channelId={chatId}>
      {({ files, discardFiles, upload }) => (
        <>
          <GroupChatHeader group={group} />
          {group && (
            files.length > 0 ? (
              <FilesPreview files={files} discardFiles={discardFiles} />
            ) : (
              <GroupChatBody group={group} />
            )
          )}
          <GroupChatInput group={group} files={files} discardFiles={discardFiles} />
        </>
      )}
    </Attachments>
  );
}

