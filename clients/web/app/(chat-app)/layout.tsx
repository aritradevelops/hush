'use client'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Menu from "./menu";
import { SocketProvider } from "@/contexts/socket-context";

const queryClient = new QueryClient();

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="w-full h-screen bg-background flex">
      <Menu />
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
          <div className="w-full flex-1 flex">
            {children}
          </div>
        </SocketProvider>
      </QueryClientProvider>
    </main>
  )
}