import { cn } from "@/lib/utils"
import { CheckCircledIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { cva, VariantProps } from "class-variance-authority"
import { Info } from "lucide-react"
import * as React from "react"

const messageVariants = cva(
  "flex items-center rounded-md shadow-lg py-1 px-2", // Shadow for glossy effect
  {
    variants: {
      variant: {
        default: "bg-blue-500 bg-opacity-20 text-blue-600 border-blue-600 border rounded-md", // 50% opacity
        success: "bg-green-500 bg-opacity-20 text-green-600 border-green-600 border rounded-md",
        error: "bg-rose-500 bg-opacity-20 text-rose-600 border-rose-600 border rounded-md",
        warning: "bg-yellow-500 bg-opacity-20 text-yellow-600 border-yellow-600 border rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const iconMap = {
  default: Info,
  success: CheckCircledIcon,
  error: ExclamationTriangleIcon,
  warning: Info,
}

export interface MessageProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof messageVariants> {
  message: string
}

const Message = React.forwardRef<HTMLDivElement, MessageProps>(
  ({ className, message, variant, ...props }, ref) => {
    const Icon = iconMap[variant || "default"]
    return (
      <div
        className={cn(messageVariants({ variant }), className)}
        ref={ref}
        role="alert"
        {...props}
      >
        <Icon className={`w-5 h-5 mr-3 flex-shrink-0 text-${variant || "blue"}-500`} aria-hidden="true" /> {/* Icon with matching color */}
        <div>{message}</div>
      </div>
    )
  }
)
Message.displayName = "Message"

export { Message, messageVariants }
