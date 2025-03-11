import React from 'react'
import Menu from './menu'
import ChatSideBar from './chat-sidebar'

export default function Chats() {
  return (
    <main className='w-full h-lvh flex'>
      <Menu />
      <ChatSideBar />
    </main>
  )
}
