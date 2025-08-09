'use client'
import { useStartUpContext } from '@/contexts/startup-context';
import Joyride, { CallBackProps, Step } from 'react-joyride';
const tourSteps: Step[] = [
  {
    target: '#add-contact',
    content: 'Add new contact...',
    disableBeacon: true,
  }, {
    target: '#create-group',
    content: 'Create new group...',
    disableBeacon: true,
  },
  {
    target: '#search-chats',
    content: 'Search your contacts here...',
    disableBeacon: true
  },
  {
    target: '#profile',
    content: 'See your profile here...',
    disableBeacon: true,
    placement: "right"
  },
  {
    target: '#settings',
    content: 'Modify your settings here...',
    disableBeacon: true,
    placement: 'right'
  }
]

function Tour() {
  const { showTour, completeTour } = useStartUpContext()
  const handleCallback = (data: CallBackProps) => {
    if (data.status == 'finished') {
      completeTour()
    }
  }
  return (
    <>
      {showTour && <Joyride steps={tourSteps} debug={true} callback={handleCallback} />}
    </>
  )
}

export default Tour