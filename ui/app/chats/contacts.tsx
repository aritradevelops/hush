
import React from 'react'

// on smaller screens take full width on bigger screens take 1/3 of the width
export default function Contacts() {
  return (
    <div className='w-full h-full bg-primary/10 sm:w-1/3 sm:max-w'>
      <Header />
    </div>
  )
}

function Header() {
  return (
    <div className='w-full h-16 p-4'>
      <h1 className='text-2xl font-bold'>Chats</h1>
    </div>
  )
}
function SearchBar() {
  
}