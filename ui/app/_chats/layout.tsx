import React from 'react'
import Menu from './menu'
import ChatSidebar from './chat-sidebar'
import { EncryptionKeyModal } from './encryption-modal'

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className='w-full h-lvh flex'>
      <EncryptionKeyModal />
      <Menu />
      <ChatSidebar />
      {children}
    </main>
  )
}
