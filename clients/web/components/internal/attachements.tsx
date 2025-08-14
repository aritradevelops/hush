import { cn } from "@/lib/utils";
import { Chat } from "@/types/entities";
import { UUID } from "crypto";
import { CloudUpload } from "lucide-react";
import React, { useEffect } from "react";
import Dropzone from "react-dropzone";

interface AttachmentsProps {
  children: (props: {
    files: File[],
    discardFiles: () => void
    upload: (chat: Chat, sharedSecret: Uint8Array) => Promise<void>
    openDropZone: () => void
    openFileDialog: () => void
  }) => React.ReactNode;
  channelId: UUID
}

export function Attachments({ children, channelId }: AttachmentsProps) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const handleDrop = (acceptedFiles: File[]) => {
    console.debug('Accepted files:', acceptedFiles);
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
    setIsDragging(false);
  };

  const discardFiles = () => {
    setFiles([])
  }
  useEffect(() => {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Esc' || e.key === 'Escape') {
        setIsDragging(false)
      }
    })
  }, [])

  const openDropZone = () => {
    setIsDragging(true)
  }
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
        console.debug(e)
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
      noClick
      noKeyboard
    >
      {({ getRootProps, getInputProps, open }) => (
        <div
          {...getRootProps()}
          className={cn(
            "flex-1 flex flex-col h-full relative",
            isDragging ? "after:absolute after:inset-0 after:bg-primary/10 after:border-2 after:border-dashed after:border-primary after:rounded-md after:pointer-events-none after:z-10" : ""
          )}
        >
          <input {...getInputProps()} />
          {isDragging && (
            // This div is not actually clickable and the elements in the background is hoverable how to fix that
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-auto">
              <div className=" bg-background p-8 rounded-2xl shadow-2xl border-2 border-primary/50 flex flex-col gap-4 items-center text-center">
                <div className="text-4xl mb-2 text-primary/70 animate-pulse">
                  <CloudUpload width={40} height={40} />
                </div>
                <p className="text-2xl font-bold text-primary">Drop files&nbsp;here</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg text-muted-foreground">or</span>
                  <button onClick={open}><span className="text-lg font-medium text-primary underline underline-offset-4">click to browse</span></button>
                </div>
                <p className="text-xs text-accent-foreground mt-4 italic opacity-75">Press <kbd className="px-1 rounded bg-muted">Esc</kbd> to exit</p>
              </div>
            </div>

          )}
          {children({ files, discardFiles, upload, openDropZone, openFileDialog: open })}
        </div>
      )}
    </Dropzone>
  );
}