'use client'
import React, { useEffect, useState } from 'react'
import Joyride, { Step, CallBackProps } from 'react-joyride';
const tourSteps: Step[] = [
  {
    target: '#add-contact',
    content: 'Add new contacts...',
    disableBeacon: true,
  }, {
    target: '#create-group',
    content: 'Create new groups...',
    disableBeacon: true,
  },
  {
    target: '#search-chats',
    content: 'Search your contacts here...',
    disableBeacon: true
  }
]

function Tour() {
  const [isTourCompleted, setIsTourCompleted] = useState<string | null>('completed')
  useEffect(() => {
    // delay for the page to fully load
    setTimeout(() => {
      console.log('executing..')
      setIsTourCompleted(localStorage.getItem('tour_status'))
    }, 1000)
  }, [])
  const handleCallback = (data: CallBackProps) => {
    if (data.status == 'finished') {
      localStorage.setItem('tour_status', 'completed')
      setIsTourCompleted('completed')
    }
  }
  return (
    <>
      {!isTourCompleted && <Joyride steps={tourSteps} debug={true} callback={handleCallback} />}
    </>
  )
}

export default Tour