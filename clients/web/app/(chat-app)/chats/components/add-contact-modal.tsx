'use client'
import { useSocket } from '@/contexts/socket-context';
import { useMe } from '@/contexts/user-context';
import { Base64Utils } from '@/lib/base64';
import { AESGCM, RSAKeyPair } from '@/lib/encryption';
import httpClient from '@/lib/http-client';
import keysManager from '@/lib/internal/keys-manager';
import { ReactQueryKeys } from '@/types/react-query';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UUID } from 'crypto';
import { X } from 'lucide-react';
import { useState } from 'react';
import { ChatSearchBar } from './chat-search-bar';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddContactModal({ isOpen, onClose }: AddContactModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();
  const { addContact } = useSocket();
  const { user } = useMe()
  const [adding, setAdding] = useState(false)
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: [ReactQueryKeys.NEW_CONTACTS, searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const response = await httpClient.listUnknownsUsers(searchQuery);
      return response.data;
    },
  });

  const handleAddContact = async (contactId: UUID) => {
    setAdding(true)
    addContact(contactId, async (ch) => {
      const sharedSecret = AESGCM.generateKey();
      const publicKeys = await httpClient.listPublicKeysForUsers([user.id, contactId])
      for (const publicKey of publicKeys.data) {
        const encryptedSharedSecret = await RSAKeyPair.encryptWithPublicKey(sharedSecret, publicKey.key);
        await httpClient.createSharedSecret({
          encrypted_shared_secret: encryptedSharedSecret,
          channel_id: ch.id,
          user_id: publicKey.user_id
        });

      }
      // save the shared secret to the locally
      await keysManager.setSharedSecret(ch.id, Base64Utils.encode(sharedSecret))
      queryClient.invalidateQueries({ queryKey: [ReactQueryKeys.CHANNEL_OVERVIEW] });
      onClose();
      setAdding(false)
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50">
      <div className="bg-card/95 rounded-lg w-[500px] max-h-[600px] flex flex-col shadow-xl border">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Add New Contact</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <ChatSearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="Search by name or email..."
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
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
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-accent/50 hover:bg-accent/70 transition-colors"
                >
                  <div className="flex items-center">
                    <img
                      src={contact.dp || `https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.name}`}
                      alt={contact.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="ml-4">
                      <h3 className="font-medium">{contact.name}</h3>
                      <p className="text-sm text-muted-foreground">{contact.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddContact(contact.id)}
                    disabled={adding}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {adding ? 'Adding...' : 'Add'}
                  </button>
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-center text-muted-foreground py-8">
              No contacts found
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Search for contacts to add
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 