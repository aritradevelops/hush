import { useMe } from "@/contexts/user-context";
import keysManager from "@/lib/internal/keys-manager";
import { ChatMedia, ChatMediaStatus } from "@/types/entities";
import { useEffect, useState } from "react";

enum AttachmentStatus {
  READY = 1,
  ENCRYPTED = 2,
  DECRYPTING = 3,
  ERROR = 4
}

interface DecryptedMedia {
  blob: Blob;
  url: string;
}

export function ShowAttachments({ attachments }: { attachments: ChatMedia[] }) {
  // Determine grid layout based on number of attachments
  const getGridClass = (count: number) => {
    if (count === 1) return "grid-cols-1";
    // if (count === 2) return "grid-cols-2";
    // if (count === 3) return "grid-cols-2"; // 2 on top, 1 below
    return "grid-cols-2";
  };

  const gridClass = getGridClass(attachments.length);
  const displayAttachments = attachments.slice(0, Math.min(4, attachments.length));
  const hasMoreAttachments = attachments.length > 4;

  return (
    <div className={`grid ${gridClass} gap-3 h-64 w-full max-w-lg mb-3 rounded-xl overflow-hidden`}>
      {displayAttachments.map((attachment, index) => (
        <AttachmentItem
          key={attachment.id || index}
          attachment={attachment}
          index={index}
          totalCount={attachments.length}
          isLastItem={index === 3 && hasMoreAttachments}
          remainingCount={hasMoreAttachments ? attachments.length - 4 : 0}
        />
      ))}
    </div>
  );
}

interface AttachmentItemProps {
  attachment: ChatMedia;
  index: number;
  totalCount: number;
  isLastItem: boolean;
  remainingCount: number;
}

function AttachmentItem({
  attachment,
  index,
  totalCount,
  isLastItem,
  remainingCount,
}: AttachmentItemProps) {
  const [decryptedMedia, setDecryptedMedia] = useState<DecryptedMedia | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptionError, setDecryptionError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { user } = useMe();

  // Handle decryption for encrypted attachments
  useEffect(() => {
    if (attachment.status === ChatMediaStatus.UPLOADED) {
      handleDecryption();
    } else {
      setDecryptedMedia({
        blob: new Blob(),
        url: attachment.cloud_storage_url
      });
    }
  }, [attachment]);

  const handleDecryption = async () => {
    setIsDecrypting(true);
    setDecryptionError(null);

    try {
      // Simulate calling worker thread for decryption
      const key = await keysManager.getSharedSecret(attachment.channel_id, user.email);
      const decryptedBuffer = await decryptAttachment(attachment, key);
      const decryptedBlob = new Blob([decryptedBuffer], { type: attachment.mime_type });
      const url = URL.createObjectURL(decryptedBlob);

      setDecryptedMedia({
        blob: decryptedBlob,
        url: url
      });
    } catch (error) {
      setDecryptionError('Failed to decrypt media');
      console.error('Decryption error:', error);
    } finally {
      setIsDecrypting(false);
    }
  };

  // Download functionality
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDownloading) return;

    setIsDownloading(true);

    try {
      let blobToDownload: Blob;
      let fileName = attachment.name || 'download';

      if (attachment.status === ChatMediaStatus.UPLOADED) {
        // For encrypted files, use decrypted blob or decrypt if not available
        if (decryptedMedia?.blob) {
          blobToDownload = decryptedMedia.blob;
        } else {
          // Decrypt on the fly for download
          const key = await keysManager.getSharedSecret(attachment.channel_id, user.email);
          const decryptedBuffer = await decryptAttachment(attachment, key);
          blobToDownload = new Blob([decryptedBuffer], { type: attachment.mime_type });
        }
      } else {
        // For non-encrypted files, fetch from URL
        const response = await fetch(attachment.cloud_storage_url);
        if (!response.ok) {
          throw new Error('Failed to fetch file');
        }
        blobToDownload = await response.blob();
      }

      // Create download link and trigger download
      const downloadUrl = URL.createObjectURL(blobToDownload);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);

    } catch (error) {
      console.error('Download failed:', error);
      // You could show a toast notification here
    } finally {
      setIsDownloading(false);
    }
  };

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (decryptedMedia?.url) {
        URL.revokeObjectURL(decryptedMedia.url);
      }
    };
  }, [decryptedMedia]);

  const isEncrypted = attachment.status === ChatMediaStatus.UPLOADED;
  const isReady = decryptedMedia;
  const mediaUrl = decryptedMedia?.url || attachment.cloud_storage_url;

  return (
    <div
      className={`
        group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 
        shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]
        border border-gray-200/80 backdrop-blur-sm cursor-pointer
        ${totalCount === 3 && index === 2 ? 'col-span-2' : ''}
        ${isLastItem ? 'relative' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Loading State for Encrypted Content */}
      {(isEncrypted && isDecrypting) && (
        <EncryptionLoader />
      )}

      {/* Error State */}
      {decryptionError && (
        <ErrorState error={decryptionError} onRetry={handleDecryption} />
      )}

      {/* Media Content */}
      {isReady && !decryptionError && (
        <MediaContent
          attachment={attachment}
          mediaUrl={mediaUrl}
        />
      )}

      {/* Download Button Overlay */}
      {isReady && !decryptionError && (isHovered || isDownloading) && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-20 transition-all duration-200">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={`
              flex flex-col items-center justify-center gap-3 px-6 py-4 
              bg-white/95 hover:bg-white text-gray-800 rounded-2xl 
              shadow-xl transition-all duration-200 transform
              ${isDownloading ? 'scale-95 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
              border border-gray-200/50 backdrop-blur-sm
            `}
          >
            {isDownloading ? (
              <>
                {/* Loading spinner */}
                <div className="w-8 h-8 border-3 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="text-sm font-medium text-gray-600">Downloading...</span>
              </>
            ) : (
              <>
                {/* Download icon */}
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-800 mb-1">Download</div>
                  <div className="text-xs text-gray-600 truncate max-w-32" title={attachment.name}>
                    {attachment.name}
                  </div>
                </div>
              </>
            )}
          </button>
        </div>
      )}

      {/* File Counter Badge */}
      {totalCount > 1 && (
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-lg z-10">
          {index + 1}/{totalCount}
        </div>
      )}

      {/* More Files Overlay */}
      {isLastItem && remainingCount > 0 && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="text-center text-white">
            <div className="text-2xl font-bold mb-1">
              +{remainingCount}
            </div>
            <div className="text-sm opacity-90">
              more files
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced MediaContent component with better hover states
function MediaContent({ attachment, mediaUrl }: { attachment: ChatMedia; mediaUrl: string }) {
  if (attachment.mime_type.startsWith('image')) {
    return (
      <img
        src={mediaUrl}
        alt={attachment.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />
    );
  }

  if (attachment.mime_type.startsWith('video')) {
    return (
      <div className="relative w-full h-full">
        <video
          src={mediaUrl}
          className="w-full h-full object-cover"
          preload="metadata"
          muted
        />
        {/* Video play icon overlay */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
          <div className="bg-white/20 rounded-full p-2">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  // Other file types
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-700 p-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-full p-3 mb-3 shadow-sm group-hover:scale-110 transition-transform duration-200">
        <svg
          className="w-8 h-8 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <span className="text-sm font-semibold text-center truncate w-full mb-1">
        {attachment.name}
      </span>
      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
        {attachment.mime_type.split('/')[1]?.toUpperCase()}
      </span>
    </div>
  );
}


function EncryptionLoader() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center z-20">
      <div className="text-center">
        {/* Animated lock icon */}
        <div className="relative mb-4">
          <div className="w-40 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <svg
            className="absolute inset-0 m-auto w-6 h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <div className="text-sm font-medium text-blue-700 mb-1">Decrypting...</div>
        <div className="text-xs text-blue-600 opacity-75">Secure content loading</div>
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center z-20">
      <div className="text-center p-4">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3 mx-auto">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <div className="text-sm font-medium text-red-700 mb-2">{error}</div>
        <button
          onClick={onRetry}
          className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-full font-medium transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

// Mock function - replace with actual decryption logic
async function decryptAttachment(attachment: ChatMedia, sharedSecret: Uint8Array): Promise<ArrayBuffer> {
  // Simulate worker thread decryption
  return new Promise((resolve, reject) => {
    const worker = new window.Worker('/workers/download-decrypt.worker.js', {
      type: 'module',
      name: attachment.id + 'downloader'
    })
    worker.postMessage({
      media: attachment,
      sharedSecret
    })
    worker.addEventListener('message', (e) => {
      const { data, error } = e.data
      worker.terminate()
      if (error) reject(error)
      else resolve(data.decrypted)
    })

  });
}