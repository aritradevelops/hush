import { ChatOptions } from '@/app/(chat-app)/chats/components/chat-options';
import { ChatSearchBar } from '@/app/(chat-app)/chats/components/chat-search-bar';

interface ChatHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  openModal: (modal: 'add-contact' | 'create-group' | null) => void;
}

export const ChatHeader = ({ searchQuery, setSearchQuery, openModal }: ChatHeaderProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Hush</h1>
        <ChatOptions openModal={openModal} />
      </div>
      <ChatSearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
    </div>
  );
};