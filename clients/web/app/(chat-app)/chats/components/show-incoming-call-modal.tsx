'use client'

import { Button } from "@/components/ui/button"
import { DialogContent, DialogDescription, DialogHeader } from "@/components/ui/dialog"
import { useMe } from "@/contexts/user-context"
import { useCall } from "@/hooks/use-call"
import { Dialog, DialogTitle } from "@radix-ui/react-dialog"
import { PhoneCall, PhoneMissed } from "lucide-react"

export function IncomingCallModal() {
  const { joinCall, closeIncomingCallModal } = useCall()
  const { user } = useMe()

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader className="flex flex-col items-center space-y-4">
          <img
            src={user.dp || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
            alt={user.name}
            className="w-20 h-20 rounded-full border-4"
          />
          <div className="text-center space-y-1">
            <DialogTitle className="text-xl font-semibold">{user.name}</DialogTitle>
            <DialogDescription className="text-lg font-medium text-foreground">
              is calling...
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex justify-center gap-6 mt-6">
          <div
            onClick={() => {
              joinCall()
              closeIncomingCallModal()
            }}
            className="w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center cursor-pointer transition"
          >
            <PhoneCall className="w-6 h-6" />
          </div>
          <div
            onClick={closeIncomingCallModal}
            className="w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center cursor-pointer transition"
          >
            <PhoneMissed className="w-6 h-6" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
