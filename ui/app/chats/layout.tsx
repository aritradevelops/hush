import React from 'react'
import Menu from './menu'
import ChatSidebar from './chat-sidebar'

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className='w-full h-lvh flex'>
      <Menu />
      <ChatSidebar />
      {children}
    </main>
  )
}
