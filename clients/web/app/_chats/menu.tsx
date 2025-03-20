import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MessageSquareText, Phone, Settings } from 'lucide-react';
import React from 'react';

interface MenuOptionProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

function MenuOption({ icon, label, onClick }: MenuOptionProps) {
  return (


    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className='w-full h-full py-2 flex flex-col justify-center items-center cursor-pointer rounded-full sm:h-max sm:flex-row '
            onClick={onClick}
          >{icon}</div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip >
    </TooltipProvider >
  );
}

export default function Menu() {
  return (
    <div className='absolute bottom-0 left-0 w-full h-16 flex bg-background z-10 sm:relative sm:flex-col sm:w-20 sm:h-lvh sm:pt-5 sm:gap-y-6'>
      <MenuOption icon={<MessageSquareText />} label="Chats" />
      <MenuOption icon={<Settings />} label="Settings" />
      <MenuOption icon={<Phone />} label="Calls" />
    </div>
  )
}
