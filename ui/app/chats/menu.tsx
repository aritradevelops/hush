import React from 'react'
import { PiChatsCircle } from "react-icons/pi";
import { IoCallOutline, IoSettingsOutline } from "react-icons/io5";

// Font awesome pixel sizes relative to the multiplier. 
// 1x - 14px
// 2x - 28px
// 3x - 42px
// 4x - 56px
// 5x - 70px
const iconSize = 35;

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
    <div className='absolute bottom-0 left-0 w-full h-16 flex bg-primary/5 sm:relative sm:flex-col sm:w-16 sm:h-lvh sm:pt-5'>
      <MenuOption icon={<PiChatsCircle size={iconSize} />} label="Chats" />
      <MenuOption icon={<IoCallOutline size={iconSize} />} label="Calls" />
      <MenuOption icon={<IoSettingsOutline size={iconSize} />} label="Settings" />
    </div>
  )
}
