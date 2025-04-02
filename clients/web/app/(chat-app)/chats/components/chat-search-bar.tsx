'use client'
import { Search } from 'lucide-react';

interface ChatSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  placeholder?: string;
}

export function ChatSearchBar({ searchQuery, setSearchQuery, placeholder = "Search chats..." }: ChatSearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-2 rounded-lg bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
} 