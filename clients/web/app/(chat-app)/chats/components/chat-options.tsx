'use client'
import { UserPlus, Users } from 'lucide-react';
import { AddContactModal } from './add-contact-modal';
import { CreateGroupModal } from './create-group-modal';

type Option = {
  label: string;
  value: string;
  icon: React.ReactNode;
  modal: React.ReactNode;
};

const options: Option[] = [
  {
    label: 'Add Contact',
    value: 'add-contact',
    icon: <UserPlus className="h-5 w-5" />,
    modal: <AddContactModal isOpen={true} onClose={() => { }} />
  },
  {
    label: 'Create Group',
    value: 'create-group',
    icon: <Users className="h-5 w-5" />,
    modal: <CreateGroupModal isOpen={true} onClose={() => { }} />
  }
];
export interface ChatOptionsProps {
  setIsAddContactModalOpen: (isOpen: boolean) => void;
}

export function ChatOptions({ setIsAddContactModalOpen }: ChatOptionsProps) {
  return (
    <div className="flex gap-2">
      {options.map(o =>
        <button
          onClick={() => setIsAddContactModalOpen(true)}
          className="p-2 rounded-lg bg-accent hover:bg-accent/80 transition-colors cursor-pointer"
          title={o.label}
          key={o.value}
        >
          {o.icon}
        </button>
      )}
    </div>
  );
} 