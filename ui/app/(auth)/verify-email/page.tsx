'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import Link from 'next/link';
import { SiTicktick } from 'react-icons/si';
import { RxCrossCircled } from 'react-icons/rx';
import httpClient from '@/lib/httpClient';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const hash = searchParams.get('hash');
  const router = useRouter();
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    if (!hash) {
      router.push('/notfound');
      return;
    }

    const verifyEmail = async () => {
      try {
        const isVerified = await httpClient.verifyEmail(hash);
        setVerified(isVerified);
      } catch (error) {
        setVerified(false);
      }
    };

    verifyEmail();
  }, [hash, router]);

  if (verified === null) {
    return <div className="flex min-h-screen items-center justify-center">Verifying...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Branding Section */}
      <div className="relative flex flex-col items-center justify-center bg-gradient-to-b from-primary/20 to-primary/5 p-8 text-center md:w-1/2">
        <div className="relative z-10 max-w-md">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 text-2xl font-bold">
              <Lock className="h-8 w-8 text-primary" />
              <span>Hush</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Join the <span className="text-primary">private</span> conversation
          </h1>
          <p className="mt-4 text-muted-foreground md:text-lg">
            Create your Hush account and start enjoying end-to-end encrypted messaging with friends and family.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="relative overflow-hidden rounded-xl border bg-background p-2 shadow-xl">
              <div className="flex items-center justify-between rounded-lg bg-muted p-2">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    H
                  </div>
                  <div className="text-sm font-medium">Hush Chat</div>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-start space-x-2">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold">
                    H
                  </div>
                  <div className="rounded-lg bg-muted p-2 text-sm">
                    Welcome to Hush! Your privacy journey begins here.
                  </div>
                </div>
                <div className="flex items-start space-x-2 justify-end">
                  <div className="rounded-lg bg-primary p-2 text-sm text-primary-foreground">
                    Thanks! I'm excited to have secure conversations.
                  </div>
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    Y
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {verified ? <VerificationSuccess /> : <VerificationFailure />}
    </div>
  );
}

function VerificationSuccess() {
  return (
    <div className="flex items-center justify-center mx-auto">
      <div className="text-center p-8 rounded-lg shadow-md max-w-md w-full">
        <SiTicktick className="w-16 h-16 mx-auto text-green-500 mb-4" />
        <h1 className="text-2xl font-bold mb-4">Email Verified Successfully</h1>
        <p className="text-gray-600 mb-6">
          Thank you for signing up with us! Please click the button below to continue to the sign-in page.
        </p>
        <Button className="w-full cursor-pointer">
          <Link href="/login" className='w-full'>Continue to Sign In</Link>
        </Button>
      </div>
    </div>
  );
}

function VerificationFailure() {
  return (
    <div className="flex items-center justify-center mx-auto">
      <div className="text-center p-8 rounded-lg shadow-md max-w-md w-full">
        <RxCrossCircled className="w-16 h-16 mx-auto text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-4">Email Verification Failed</h1>
        <p className="text-gray-600 mb-6">
          Invalid or expired verification link. Please{' '}
          <a
            href={`mailto:${process.env.NEXT_PUBLIC_ADMIN_CONTACT_EMAIL}`}
            className="text-blue-600 font-semibold hover:text-blue-800 hover:underline transition duration-200 ease-in-out"
            target="_blank"
            rel="noopener noreferrer"
          >
            contact the administrator
          </a>.
        </p>
        <Button className="w-full cursor-pointer">
          <Link href="/register" className='w-full'>Continue to sign up</Link>
        </Button>
      </div>
    </div>
  );
}
