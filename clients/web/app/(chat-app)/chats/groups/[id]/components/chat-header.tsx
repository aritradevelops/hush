import { Contact, Group, GroupMember } from "@/types/entities";

export function ChatHeader({ group }: { group?: Group & { members: (GroupMember & { contact: Contact | null })[] } }) {
  if (!group) return <ChatHeaderSkeleton />

  return (
    <div className="border-b p-4">
      <div className="flex items-center gap-4">
        <img
          src={group.image || `https://api.dicebear.com/9.x/initials/svg?seed=${group.name}`}
          alt={group.name}
          className="w-12 h-12 rounded-full"
        />
        <div>
          <div className="flex justify-center gap-2 items-center">
            <h2 className="text-lg font-semibold">{group.name}</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Group Chat
          </p>
        </div>
      </div>
    </div>
  )
}

export function ChatHeaderSkeleton() {
  return (
    <div className="border-b p-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-accent animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 w-32 bg-accent rounded animate-pulse" />
          <div className="h-4 w-24 bg-accent rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}