"use client"

import { ArrowLeft, Lock, Mail, User } from "lucide-react"
import Link from "next/link"

import { Message } from "@/components/message"
import { PasswordInput } from "@/components/password-input"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "@/hooks/use-form"
import httpClient from "@/lib/httpClient"
import { RegisterSchema, ResetPasswordSchema } from "@/schemas/auth"
import { useRouter, useSearchParams } from "next/navigation"

export default function ResetPasswordPage() {
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

      {/* Form Section */}
      <div className="flex flex-1 items-center justify-center p-8 md:w-1/2">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-between items-center min-w-2.5">
            <Link
              href="/"
              className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </Link>
            <div className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Log in
              </Link>
            </div>
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold">Reset your password</h2>
            <p className="text-muted-foreground">Enter your new password</p>
          </div>

          <ResetPasswordForm />
        </div>
      </div>
    </div>
  )
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const hash = searchParams.get('hash');
  const router = useRouter();
  if (!hash) router.push('/notfound');
  const { form, fields, isSubmitting } = useForm({
    id: 'register',
    zodSchema: ResetPasswordSchema,
    onSubmit: async (data) => {
      return httpClient.resetPassword({ ...data, hash: hash! })
    }
  })
  return (
    <div className="space-y-6">
      <form id={form.id} onSubmit={form.onSubmit} noValidate>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={fields.password.id}>New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <PasswordInput id={fields.password.id} required className="pl-8" placeholder="Create new password" />
            </div>
            {
              fields.password.errors?.map((errorMessage, idx) => (
                <Message variant={"error"} message={errorMessage} key={idx} />
              ))
            }
          </div>

          <div className="space-y-2">
            <Label htmlFor={fields.confirm_password.id}>Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <PasswordInput id={fields.confirm_password.id} required className="pl-8" placeholder="Confirm new password" />
            </div>
            {
              fields.confirm_password.errors?.map((errorMessage, idx) => (
                <Message variant={"error"} message={errorMessage} key={idx} />
              ))
            }
          </div>
          {
            form.state !== 'none' && <Message variant={form.state} message={form.message!} />
          }
          <div className="space-y-2">
            <Button className="w-full cursor-pointer" type="submit">
              {isSubmitting ? "Resetting Password..." : "Reset Password"}
            </Button>
          </div>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 mr-2" fill="currentColor">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
            <path d="M1 1h22v22H1z" fill="none" />
          </svg>
          Google
        </Button>
        <Button variant="outline" className="w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 mr-2" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Meta
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        By creating an account, you agree to our{" "}
        <Link href="#" className="underline underline-offset-4 hover:text-primary">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="#" className="underline underline-offset-4 hover:text-primary">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  )
}

