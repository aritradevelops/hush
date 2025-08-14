import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { useMe } from "./user-context";
import secretManager from "@/lib/internal/keys-manager"
interface StartUpContextProps {
  showEncryptionModal: boolean
  showTour: boolean
  closeEncryptionModal(): void
  completeTour(): void
}
const StartUpContext = createContext<StartUpContextProps | undefined>(undefined)

export function StartUpContextProvider({ children }: { children: React.ReactNode }) {
  const [showEncryptionModal, setShowEncryptionModal] = useState(false)
  const [showTour, setShowTour] = useState(false)
  const { user } = useMe()
  const closeEncryptionModal = () => {
    setShowEncryptionModal(false)
    if (!localStorage.getItem('tour_status')) {
      // show tour
      setShowTour(true)
    }
  }
  const completeTour = () => {
    localStorage.setItem('tour_status', 'completed')
    setShowTour(false)
  }

  useEffect(() => {
    if (user) {
      // Use email as a unique identifier for the key storage
      secretManager.getEncryptionKey(user.email).then(data => {
        console.debug("Retrieved encryption key:", data)
        if (!data) {
          setShowEncryptionModal(true)
        } else {
          if (!localStorage.getItem('tour_status')) {
            // show tour
            setShowTour(true)
          }
        }
      })
    }
  }, [user])
  return <StartUpContext.Provider value={{ showEncryptionModal, showTour, completeTour, closeEncryptionModal }}>
    {children}
  </StartUpContext.Provider>
}

export const useStartUpContext = () => {
  const context = useContext(StartUpContext);
  if (context === undefined) {
    throw new Error("useStartUpContext must be used within a StartUpContextProvider");
  }
  return context;
}