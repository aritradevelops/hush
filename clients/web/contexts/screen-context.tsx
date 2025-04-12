'use client'
import React, { createContext, useContext, useEffect, useState } from 'react';

interface ScreenContextType {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const ScreenContext = createContext<ScreenContextType | undefined>(undefined);

// Breakpoint values in pixels
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

export function ScreenProvider({ children }: { children: React.ReactNode }) {
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize({
        isMobile: width < MOBILE_BREAKPOINT,
        isTablet: width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT,
        isDesktop: width >= TABLET_BREAKPOINT,
      });
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ScreenContext.Provider value={screenSize}>
      {children}
    </ScreenContext.Provider>
  );
}

export function useScreen() {
  const context = useContext(ScreenContext);
  if (context === undefined) {
    throw new Error('useScreen must be used within a ScreenProvider');
  }
  return context;
}
