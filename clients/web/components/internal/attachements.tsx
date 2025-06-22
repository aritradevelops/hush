import { cn } from "@/lib/utils";
import { Chat } from "@/types/entities";
import { UUID } from "crypto";
import React, { useEffect } from "react";
import Dropzone from "react-dropzone";

interface AttachmentsProps {
  children: (props: {
    files: File[],
    discardFiles: () => void
    upload: (chat: Chat, sharedSecret: Uint8Array) => Promise<void>
  }) => React.ReactNode;
  channelId: UUID
}

export function Attachments({ children, channelId }: AttachmentsProps) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const handleDrop = (acceptedFiles: File[]) => {
    console.log('Accepted files:', acceptedFiles);
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
    setIsDragging(false);
  };

  const discardFiles = () => {
    setFiles([])
  }
  useEffect(() => {

  }, [])

  const upload = async (chat: Chat, sharedSecret: Uint8Array) => {
    for (const f of files) {
      const uploadWorker = new window.Worker('/workers/upload-encrypt.worker.js', {
        type: 'module',
      })
      uploadWorker.postMessage({
        file: f,
        chat: chat,
        sharedSecret: sharedSecret
      })
      uploadWorker.addEventListener("message", e => {
        console.log(e)
        uploadWorker.terminate()
      })
    }
    discardFiles()
  }

  return (
    <Dropzone
      onDrop={handleDrop}
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      multiple
    >
      {({ getRootProps, getInputProps }) => (
        <div
          {...getRootProps()}
          className={cn(
            "flex-1 flex flex-col h-full relative",
            isDragging ? "after:absolute after:inset-0 after:bg-primary/10 after:border-2 after:border-dashed after:border-primary after:rounded-md after:pointer-events-none after:z-10" : ""
          )}
        >
          <input {...getInputProps()} disabled />
          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <div className="bg-background p-4 rounded-lg shadow-lg border border-primary">
                <p className="text-lg font-medium text-primary">Drop files here</p>
              </div>
            </div>
          )}
          {children({ files, discardFiles, upload })}
        </div>
      )}
    </Dropzone>
  );
}