import { AddContactModal } from '@/app/(chat-app)/chats/components/add-contact-modal';
import { CreateGroupModal } from '@/app/(chat-app)/chats/components/create-group-modal';
import { EncryptionKeyModal } from '@/app/(chat-app)/chats/components/encryption-key-modal';

interface ChatModalsProps {
  activeModal: 'add-contact' | 'create-group' | null;
  setActiveModal: (modal: 'add-contact' | 'create-group' | null) => void;
}

export const ChatModals = ({ activeModal, setActiveModal }: ChatModalsProps) => {
  return (
    <>
      <AddContactModal
        isOpen={activeModal === 'add-contact'}
        onClose={() => setActiveModal(null)}
      />
      <CreateGroupModal
        isOpen={activeModal === 'create-group'}
        onClose={() => setActiveModal(null)}
      />
      <EncryptionKeyModal />
    </>
  );
};