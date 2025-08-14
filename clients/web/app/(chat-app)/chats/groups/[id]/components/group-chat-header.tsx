import { Button } from "@/components/ui/button";
import { useCall } from "@/contexts/call-context";
import { useScreen } from "@/contexts/screen-context";
import { useMe } from "@/contexts/user-context";
import { Call, GroupDetails } from "@/types/entities";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function GroupChatHeader({ group }: { group?: GroupDetails }) {
  const { user } = useMe();
  const { call, ongoingCalls, startCall, joinCall } = useCall()
  const { isMobile } = useScreen()
  const router = useRouter()
  if (!group) {
    return <ChatHeaderSkeleton />
  }
  const localCall: Call | null = ongoingCalls.find(c => c.call.channel_id === group.id)?.call || null
  console.debug(ongoingCalls)
  const handleCLick = () => {
    if (localCall) {
      // join the call
      joinCall(localCall)
    } else {
      // start new call
      startCall(group.id, 'group', (callOrErr) => {
        if (typeof callOrErr == 'string') {
          alert(callOrErr)
        } else {
          joinCall(callOrErr)
        }
      })
    }
  }
  return (<div className="border-b p-4">
    <div className="flex items-center gap-4">
      {isMobile && <button type="button" onClick={() => router.back()}>
        <ArrowLeft />
      </button>}
      <img
        src={group.metadata?.image || `https://api.dicebear.com/9.x/initials/svg?seed=${group.metadata?.name}`}
        alt={group.metadata?.name}
        className="w-12 h-12 rounded-full"
      />
      <div>
        <div className="flex gap-2 items-center">
          <h2 className="text-lg font-semibold">{group.metadata?.name}</h2>
        </div>
        {!isMobile && <p className="text-sm text-muted-foreground truncate">
          {group.group_members.filter(member => member.user_id !== user.id).map((member) => member.contact?.nickname || member.user.name).join(", ")}
        </p>}
      </div>
      <div className="ml-auto">
        <Button
          onClick={handleCLick}
          className="bg-green-500 border-2 border-b-green-800 border-r-green-800 hover:bg-green-500"
        >
          {localCall ? 'Join Call' : 'Start Call'}
        </Button>

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