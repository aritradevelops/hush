import { MessageSquareText, Phone, Settings } from 'lucide-react';
import React from 'react';

interface MenuOptionProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

function MenuOption({ icon, label, onClick }: MenuOptionProps) {
  return (
    <div
      className='w-full h-full py-2 flex flex-col justify-center items-center cursor-pointer rounded-full sm:h-max sm:flex-row '
      onClick={onClick}
    >
      {icon}
      <span className='sm:hidden text-sm'>{label}</span>
    </div>
  );
}

export default function Menu() {
  return (
    <div className='absolute bottom-0 left-0 w-full h-16 flex bg-background z-10 sm:relative sm:flex-col sm:w-16 sm:h-lvh sm:pt-5'>
      <MenuOption icon={<MessageSquareText />} label="Chats" />
      <MenuOption icon={<Settings />} label="Calls" />
      <MenuOption icon={<Phone />} label="Settings" />
    </div>
  )
}
