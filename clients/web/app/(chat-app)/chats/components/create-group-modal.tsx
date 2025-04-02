'use client'
import { X } from 'lucide-react';
interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50">
      <div className="bg-card/95 rounded-lg w-[500px] max-h-[600px] flex flex-col shadow-xl border">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Create New Group</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          <h1>Create Group</h1>
        </div>
      </div>
    </div>
  );
} 