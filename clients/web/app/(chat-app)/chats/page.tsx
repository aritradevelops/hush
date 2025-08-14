'use client'
import { useScreen } from '@/contexts/screen-context';
import { useMediaDevices } from '@/hooks/use-media-devices';
import httpClient from '@/lib/http-client-old';
import { cn } from '@/lib/utils';
import Link from 'next/link';


export default function ChatsPage() {
  const { isMobile } = useScreen()
  return (
    <div className="w-full flex-1 flex items-center justify-center" >
      {!isMobile && (
        <div className="w-full max-w-2xl text-center px-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to Hush</h1>
          <p className="text-xl text-muted-foreground mb-12">
            Your private, secure messaging platform
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureCard
              title="End-to-End Encryption"
              description="Your messages are encrypted from start to finish, ensuring complete privacy."
              icon="🔒"
            />
            <FeatureCard
              title="Real-time Messaging"
              description="Send and receive messages instantly with real-time updates."
              icon="⚡"
            />
            <FeatureCard
              title="Group Chats"
              description="Create and manage group conversations with ease."
              icon="👥"
            />
            <FeatureCard
              title="Message Status"
              description="Know when your messages are delivered and read."
              icon="✓"
            />
          </div>
        </div>
      )}

    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="p-6 rounded-lg bg-accent/50 hover:bg-accent/80 transition-colors">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}


