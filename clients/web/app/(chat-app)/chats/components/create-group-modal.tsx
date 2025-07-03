'use client'

import { useSocket } from '@/contexts/socket-context';
import { Base64Utils } from '@/lib/base64';
import { AESGCM, RSAKeyPair } from '@/lib/encryption';
import httpClient from '@/lib/http-client';
import keysManager from '@/lib/internal/keys-manager';
import { Contact, User } from '@/types/entities';
import { ReactQueryKeys } from '@/types/react-query';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UUID } from 'crypto';
import { Check, UserPlus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ChatSearchBar } from './chat-search-bar';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { createGroup } = useSocket();

  // Fetch existing contacts
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: [ReactQueryKeys.CONTACTS, searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const response = await httpClient.listContacts({ search: searchQuery });
      return response.data;
    },
    enabled: isOpen, // Only fetch when modal is open
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setGroupName('');
      setGroupDescription('');
      setSearchQuery('');
      setSelectedContacts([]);
    }
  }, [isOpen]);

  const toggleContactSelection = (contact: Contact) => {
    setSelectedContacts(prev => {
      // Check if contact is already selected
      const isSelected = prev.some(c => c.user_id === contact.user_id);

      if (isSelected) {
        // Remove contact if already selected
        return prev.filter(c => c.user_id !== contact.user_id);
      } else {
        // Add contact if not selected
        return [...prev, contact];
      }
    });
  };

  const isContactSelected = (contactId: UUID) => {
    return selectedContacts.some(contact => contact.user_id === contactId);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedContacts.length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const memberIds = selectedContacts.map(contact => contact.user_id);
      createGroup({ name: groupName.trim(), description: groupDescription.trim(), memberIds }, async (group: { id: UUID }) => {
        // console.log('callback', group)
        // Generate a shared secret for the group
        const sharedSecret = AESGCM.generateKey();
        const publicKeys = await httpClient.listPublicKeysForUsers(memberIds);
        // Encrypt the shared secret for each member
        for (const publicKey of publicKeys.data) {
          const encryptedSharedSecret = await RSAKeyPair.encryptWithPublicKey(sharedSecret, publicKey.key);
          await httpClient.createSharedSecret({ channel_id: group.id, user_id: publicKey.user_id, encrypted_shared_secret: encryptedSharedSecret });
        }

        // Save the shared secret locally
        await keysManager.setSharedSecret(group.id, Base64Utils.encode(sharedSecret));

        queryClient.invalidateQueries({ queryKey: [ReactQueryKeys.CHANNEL_OVERVIEW] });
        setIsSubmitting(false);
        onClose();
      });
    } catch (error) {
      console.error('Error creating group:', error);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50">
      <div className="bg-card/95 rounded-lg w-[600px] max-h-[700px] flex flex-col shadow-xl border">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Create New Group</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Group Name Input */}
          <div>
            <label htmlFor="group-name" className="block text-sm font-medium mb-1">
              Group Name <span className="text-destructive">*</span>
            </label>
            <input
              id="group-name"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full p-2 rounded-md border border-input bg-background text-foreground"
              required
            />
          </div>

          {/* Group Description Input */}
          <div>
            <label htmlFor="group-description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="group-description"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder="Enter group description (optional)"
              className="w-full p-2 rounded-md border border-input bg-background text-foreground resize-none h-20"
            />
          </div>

          {/* Selected Contacts Tags */}
          {selectedContacts.length > 0 && (
            <div className="mt-2">
              <label className="block text-sm font-medium mb-2">
                Selected Contacts ({selectedContacts.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedContacts.map(contact => (
                  <div
                    key={contact.user_id}
                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary text-primary-foreground text-sm"
                  >
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.nickname}`}
                      alt={contact.nickname}
                      className="w-4 h-4 rounded-full"
                    />
                    <span>{contact.nickname}</span>
                    <button
                      className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5"
                      onClick={() => toggleContactSelection(contact)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Search */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Add Members <span className="text-destructive">*</span>
            </label>
            <ChatSearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              placeholder="Search contacts by name or email..."
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto p-4 border-t">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center p-4 rounded-lg bg-accent/50">
                  <div className="w-12 h-12 rounded-full bg-accent animate-pulse" />
                  <div className="flex-1 ml-4">
                    <div className="h-5 w-32 bg-accent rounded animate-pulse mb-2" />
                    <div className="h-4 w-48 bg-accent rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : contacts.length > 0 ? (
            <div className="space-y-2">
              {contacts.map((contact: Contact & { user: User }) => (
                <div
                  key={contact.user_id}
                  onClick={() => toggleContactSelection(contact)}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${isContactSelected(contact.user_id) ? 'bg-accent/80' : 'bg-accent/50 hover:bg-accent/70'}`}
                >
                  <div className="flex items-center">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.nickname}`}
                      alt={contact.nickname}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="ml-3">
                      <h3 className="font-medium">{contact.nickname}</h3>
                      <p className="text-sm text-muted-foreground">{contact.user.email}</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isContactSelected(contact.user_id) ? 'bg-primary text-primary-foreground' : 'border-2 border-muted-foreground'}`}>
                    {isContactSelected(contact.user_id) && <Check className="h-4 w-4" />}
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-center text-muted-foreground py-8">
              No contacts found
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Search for contacts to add to the group
            </div>
          )}
        </div>

        {/* Create Button */}
        <div className="p-4 border-t">
          <button
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || selectedContacts.length === 0 || isSubmitting}
            className="w-full py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Creating...' : 'Create Group'}
            {!isSubmitting && <UserPlus className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}