'use client'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useScreen } from '@/contexts/screen-context'
import { MessageSquareText, Settings, User } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/logo'

const MenuOptions = [
  { name: "chats", path: "./chats", icon: <MessageSquareText size={24} />, tooltip: "Chats" },
  { name: "profile", path: "./profile", icon: <User size={24} />, tooltip: "Profile" },
  { name: "settings", path: "./settings", icon: <Settings size={24} />, tooltip: "Settings" }
]

export default function Menu() {
  const { isMobile } = useScreen()
  return (
    <div>
      {isMobile ? (
        <MobileMenu />
      ) : (
        <DesktopMenu />
      )}
    </div>
  )
}

const MobileMenu = () => {
  return (
    <div className='fixed bottom-0 left-0 right-0 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border'>
      <div className='h-full max-w-4xl mx-auto flex items-center justify-around'>
        {MenuOptions.map((option) => (
          <MenuItem key={option.name} {...option} />
        ))}
      </div>
    </div>
  )
}

const DesktopMenu = () => {
  return (
    <div className='h-screen w-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r border-border'>
      <div className='h-full flex flex-col items-center py-8'>
        <div className='mb-8'>
          <Logo className="w-10 h-10" />
        </div>
        <div className='flex-1 flex flex-col items-center gap-6'>
          {MenuOptions.map((option) => (
            <MenuItem key={option.name} {...option} />
          ))}
        </div>
      </div>
    </div>
  )
}

const MenuItem = ({ name, path, icon, tooltip }: {
  name: string;
  path: string;
  icon: React.ReactNode;
  tooltip: string;
}) => {
  const pathname = usePathname()
  const isActive = pathname === path

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={path}
            className={`p-3 rounded-xl transition-colors ${isActive
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-accent text-muted-foreground hover:text-foreground'
              }`}
          >
            {icon}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="hidden md:block">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}