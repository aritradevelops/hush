import * as React from "react"

import { cn } from "@/lib/utils"
import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
}

const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    return (
      <div className={cn(
        "flex flex-1 relative focus-within:outline-none focus-within:ring-1 focus-within:ring-ring rounded-md border",
        className
      )}>
        <input
          type={showPassword ? 'text' : 'password'}
          className={cn(
            "flex h-9 w-full bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          )}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword((p) => !p)}
          className="h-9 bg-transparent px-3 py-1 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
        </button>
      </div>
    )
  }
)
PasswordInput.displayName = "Password Input"

export { PasswordInput }