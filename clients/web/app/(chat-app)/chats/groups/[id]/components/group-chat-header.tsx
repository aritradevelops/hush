import { useMe } from "@/contexts/user-context";
import { GroupDetails } from "@/types/entities";

export function GroupChatHeader({ group }: { group?: GroupDetails }) {
  const { user } = useMe();
  if (!group) {
    return <ChatHeaderSkeleton />
  }
  return (<div className="border-b p-4">
    <div className="flex items-center gap-4">
      <img
        src={group.metadata?.image || `https://api.dicebear.com/9.x/initials/svg?seed=${group.metadata?.name}`}
        alt={group.metadata?.name}
        className="w-12 h-12 rounded-full"
      />
      <div>
        <div className="flex gap-2 items-center">
          <h2 className="text-lg font-semibold">{group.metadata?.name}</h2>
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {group.group_members.filter(member => member.user_id !== user.id).map((member) => member.contact?.nickname || member.user.name).join(", ")}
        </p>
      </div>
    </div>
  </div>)

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