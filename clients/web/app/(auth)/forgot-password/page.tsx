"use client"

import { ArrowLeft, Lock, Mail } from "lucide-react"
import Link from "next/link"

import { Message } from "@/components/message"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "@/hooks/use-form"
import httpClient from "@/lib/http-client-old"
import { ForgotPasswordSchema } from "@/schemas/auth"

export default function ForgotPasswordPage() {
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
            Login to your Hush account and start enjoying end-to-end encrypted messaging with friends and family.
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
              Don't have an account?{" "}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Register
              </Link>
            </div>
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold">Forgot your password?</h2>
            <p className="text-muted-foreground">Enter your email to request the reset password link</p>
          </div>

          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  )
}

function ForgotPasswordForm() {
  const { isSubmitting, form, fields } = useForm({
    id: 'login',
    zodSchema: ForgotPasswordSchema,
    onSubmit: async function (data) {
      return await httpClient.forgotPassword(data)
    }
  })
  return (
    <div className="space-y-6">
      <form id={form.id} onSubmit={form.onSubmit}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id={fields.email.id} type="email" placeholder="Enter your email" className="pl-10" />
            </div>
            {
              fields.email.errors?.map((errorMessage, idx) => (
                <Message variant={"error"} message={errorMessage} key={idx} />
              ))
            }
          </div>
          {
            form.state !== 'none' && <Message variant={form.state} message={form.message!} />
          }
          <div className="space-y-2">
            <Button className="w-full cursor-pointer" type="submit">
              {isSubmitting ? "Requesting reset link" : "Request reset link"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

