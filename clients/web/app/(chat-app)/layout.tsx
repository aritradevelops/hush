'use client'
import { SocketProvider } from "@/contexts/socket-context";
import { UserContext, UserContextProvider, useMe } from "@/contexts/user-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Menu from "./menu";
import { useState, useEffect, useContext } from "react";
import { Loader2 } from "lucide-react";
import { CallContextProvider } from "@/contexts/call-context";

// Create a stable QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

// User data loader component that ensures user data is loaded before rendering children
function UserDataLoader({ children }: { children: React.ReactNode }) {
  const { isLoading, data: user } = useContext(UserContext)

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login if user is not authenticated
    // This ensures that user data is always available in the chat app
    const redirectToLogin = () => {
      window.location.href = `/login?next_url=${window.location.pathname}`;
    };

    // Use useEffect to handle client-side navigation
    useEffect(() => {
      redirectToLogin();
    }, []);

    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="w-full h-screen bg-background flex">
      <Menu />
      <QueryClientProvider client={queryClient}>
        <UserContextProvider>
          <UserDataLoader>
            <SocketProvider>
              <CallContextProvider>
                <div className="w-full flex-1 flex">
                  {children}
                </div>
              </CallContextProvider>
            </SocketProvider>
          </UserDataLoader>
        </UserContextProvider>
      </QueryClientProvider>
    </main>
  )
}