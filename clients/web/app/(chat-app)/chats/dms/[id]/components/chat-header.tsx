import { useSocket } from "@/contexts/socket-context";
import { DirectMessage, Contact, User, DmDetails } from "@/types/entities";
import { ReactQueryKeys } from "@/types/react-query";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@radix-ui/react-tooltip";
import { useQueryClient } from "@tanstack/react-query";
import { UserX, UserPlus } from "lucide-react";

export function ChatHeader({ dm }: { dm?: DmDetails }) {
  const { addContact } = useSocket()
  const queryClient = useQueryClient()

  if (!dm) return <ChatHeaderSkeleton />
  const handleAddContact = () => {
    addContact(dm.chat_user.id, () => {
      queryClient.invalidateQueries({ queryKey: [ReactQueryKeys.DIRECT_MESSAGE_DETAILS, dm.id] })
    })
  }

  const handleBlockUser = () => {
    // Block user functionality
    console.log('Block user:', dm.chat_user.id)
  }
  return (
    <div className="border-b p-4">
      <div className="flex items-center gap-4">
        <img
          src={dm.chat_user.dp || `https://api.dicebear.com/7.x/avataaars/svg?seed=${dm.chat_user.name}`}
          alt={dm.chat_user.name}
          className="w-12 h-12 rounded-full"
        />
        <div>
          <div className="flex justify-center gap-2 items-center">
            <h2 className="text-lg font-semibold">{dm.contact?.nickname || dm.chat_user.name}</h2>
            <div className="flex gap-2">
              {!dm.contact && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleAddContact}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4 mx-auto text-green-500" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md">
                      Add to contacts
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleBlockUser}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      <UserX className="w-4 h-4 mx-auto text-red-500" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md">
                    Block User
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Private Chat
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