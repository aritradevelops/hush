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
//! NOTE: per page should be at least a number that overflows the chat body 
//! else the scroll bar won't show and infinite scroll won't work
// TODO: figure out a solution for this
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
    // <Dropzone onDrop={handleDrop} onDragEnter={() => setIsDragging(true)} onDragLeave={() => setIsDragging(false)} multiple>
    //   {({ getRootProps, getInputProps }) => (
    //     <div
    //       {...getRootProps()}
    //       className={cn(
    //         "flex-1 flex flex-col h-full relative",
    //         isDragging ? "after:absolute after:inset-0 after:bg-primary/10 after:border-2 after:border-dashed after:border-primary after:rounded-md after:pointer-events-none after:z-10" : ""
    //       )}
    //     >
    //       <GroupChatHeader group={group} />
    //       {group && (
    //         files.length > 0 ? (
    //           <FilesPreview files={files} group={group} />
    //         ) : (
    //           <GroupChatBody group={group} />
    //         )
    //       )}
    //       <input {...getInputProps()} />
    //       {/* {isDragging && (
    //         <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
    //           <div className="bg-background p-4 rounded-lg shadow-lg border border-primary">
    //             <p className="text-lg font-medium text-primary">Drop files here</p>
    //           </div>
    //         </div>
    //       )} */}
    //       <GroupChatInput group={group} files={files} />
    //     </div>
    //   )}
    // </Dropzone>
    <div className="flex-1 flex flex-col h-full">
      <GroupChatHeader group={group} />
      <GroupChatBody group={group} />
      <GroupChatInput group={group} files={files} />
    </div>
  );
}



// export function FilesPreview({ files, group }: { files: File[], group: GroupDetails }) {
//   const [showAll, setShowAll] = React.useState(false);
//   const maxPreviewFiles = 3;

//   const handleRemoveFile = (indexToRemove: number) => {
//     // This function would need to communicate with the parent component
//     // For now, we'll just log it
//     console.log('Remove file at index:', indexToRemove);
//   };

//   const getFilePreview = (file: File) => {
//     const fileType = file.type.split('/')[0];

//     if (fileType === 'image') {
//       return (
//         <img
//           src={URL.createObjectURL(file)}
//           alt={file.name}
//           className="w-48 h-48 object-cover rounded"
//         />
//       );
//     } else if (fileType === 'video') {
//       return (
//         <div className="w-48 h-48 bg-black flex items-center justify-center rounded">
//           <svg className="w-12 h-12 text-white" viewBox="0 0 24 24">
//             <path fill="currentColor" d="M8 5v14l11-7z" />
//           </svg>
//         </div>
//       );
//     } else if (file.type === 'application/pdf') {
//       return (
//         <div className="w-48 h-48 bg-red-100 flex items-center justify-center rounded">
//           <svg className="w-12 h-12 text-red-500" viewBox="0 0 24 24">
//             <path fill="currentColor" d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm12 6V9c0-.55-.45-1-1-1h-2v5h2c.55 0 1-.45 1-1zm-2-3h1v3h-1V9z" />
//           </svg>
//         </div>
//       );
//     } else {
//       return (
//         <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded">
//           <svg className="w-12 h-12 text-gray-500" viewBox="0 0 24 24">
//             <path fill="currentColor" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
//           </svg>
//         </div>
//       );
//     }
//   };

//   // File size formatter
//   const formatFileSize = (bytes: number) => {
//     if (bytes < 1024) return bytes + ' B';
//     else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
//     else return (bytes / 1048576).toFixed(1) + ' MB';
//   };

//   const visibleFiles = showAll ? files : files.slice(0, maxPreviewFiles);
//   const hiddenFilesCount = files.length - maxPreviewFiles;

//   return (
//     <div className="flex-1 overflow-y-auto bg-background border-t border-border p-4">
//       <div className="mb-4">
//         <h3 className="text-xl font-semibold mb-4">Attachments ({files.length})</h3>
//         <div className="flex flex-wrap gap-4">
//           {visibleFiles.map((file, index) => (
//             <div key={index} className="relative group">
//               <div className="relative overflow-hidden rounded border border-border">
//                 {getFilePreview(file)}
//               </div>
//               <button
//                 onClick={() => handleRemoveFile(index)}
//                 className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
//               >
//                 ✕
//               </button>
//               <div className="mt-1 text-sm text-muted-foreground w-48 truncate">
//                 {file.name}
//               </div>
//               <div className="text-xs text-muted-foreground">
//                 {formatFileSize(file.size)}
//               </div>
//             </div>
//           ))}

//           {!showAll && hiddenFilesCount > 0 && (
//             <div
//               className="bg-muted flex items-center justify-center rounded cursor-pointer border border-border"
//               onClick={() => setShowAll(true)}
//             >
//               <span className="text-sm font-medium">+{hiddenFilesCount} more</span>
//             </div>
//           )}
//         </div>

//         {showAll && files.length > maxPreviewFiles && (
//           <button
//             className="text-xs text-primary mt-2"
//             onClick={() => setShowAll(false)}
//           >
//             Show less
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }
