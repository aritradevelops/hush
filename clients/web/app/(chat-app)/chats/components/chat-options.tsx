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
export type ModalType = 'add-contact' | 'create-group' | null;

export interface ChatOptionsProps {
  openModal: (modalType: ModalType) => void;
}

export function ChatOptions({ openModal }: ChatOptionsProps) {
  return (
    <div className="flex gap-2">
      {options.map(option => (
        <button
          id={option.value}
          onClick={() => openModal(option.value as ModalType)}
          className="p-2 rounded-lg bg-accent hover:bg-accent/80 transition-colors cursor-pointer"
          title={option.label}
          key={option.value}
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
} 