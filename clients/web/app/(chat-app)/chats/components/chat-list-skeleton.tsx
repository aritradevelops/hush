'use client'

export function ChatListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Pinned Chats Skeleton */}
      <div className="mb-6">
        <div className="h-4 w-24 bg-accent rounded animate-pulse mb-2" />
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center p-4 rounded-lg bg-accent/50">
              <div className="w-14 h-14 rounded-full bg-accent animate-pulse" />
              <div className="flex-1 ml-4">
                <div className="h-5 w-32 bg-accent rounded animate-pulse mb-2" />
                <div className="h-4 w-48 bg-accent rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Chats Skeleton */}
      <div>
        <div className="h-4 w-24 bg-accent rounded animate-pulse mb-2" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center p-4 rounded-lg bg-accent/50">
              <div className="w-14 h-14 rounded-full bg-accent animate-pulse" />
              <div className="flex-1 ml-4">
                <div className="h-5 w-32 bg-accent rounded animate-pulse mb-2" />
                <div className="h-4 w-48 bg-accent rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 