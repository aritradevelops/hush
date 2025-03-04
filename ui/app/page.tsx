import Link from "next/link"
import Image from "next/image"
import {
  Shield,
  Lock,
  MessageSquare,
  Video,
  Phone,
  ImageIcon,
  Users,
  Zap,
  Check,
  Download,
  ChevronRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-8">
        <div className="container flex justify-between h-16 items-center space-x-4 sm:justify-between sm:space-x-0 mx-auto">
          <div className="flex gap-2 items-center text-xl font-bold">
            <Lock className="h-6 w-6 text-primary" />
            <span>Hush</span>
          </div>
          <div className="hidden md:flex items-center space-x-1 gap-2">
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="#features" className="transition-colors hover:text-foreground/80">
                Features
              </Link>
              <Link href="#security" className="transition-colors hover:text-foreground/80">
                Security
              </Link>
              <Link href="#testimonials" className="transition-colors hover:text-foreground/80">
                Testimonials
              </Link>
              <Link href="#download" className="transition-colors hover:text-foreground/80">
                Download
              </Link>
            </nav>
            <div className="flex items-center space-x-2">
              <Button variant="secondary" size="sm">
                <Link href={"/register"}>Register</Link>
              </Button>
              <Button size="sm"><Link href={"/login"}>Log in</Link></Button>
            </div>
          </div>
          <div className="flex md:hidden">
            <Button variant="ghost" size="sm" className="px-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Your conversations deserve <span className="text-primary">privacy</span>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Hush is an end-to-end encrypted messaging app that keeps your conversations secure and private.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" className="cursor-pointer">
                    <Link href={"/register"} className="gap-1.5 flex items-center">Get Started <ChevronRight className="h-4 w-4" /></Link>
                  </Button>
                  <Button size="lg" variant="outline">
                    Learn more
                  </Button>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-xs">End-to-end encrypted</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-xs">100% Private</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-xs">Lightning fast</span>
                  </div>
                </div>
              </div>
              <div className="mx-auto flex items-center justify-center relative">
                <div className="relative z-10 overflow-hidden rounded-xl border bg-background p-2 shadow-xl">
                  <div className="flex items-center justify-between rounded-lg bg-muted p-2">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                        H
                      </div>
                      <div className="text-sm font-medium">Hush Chat</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <Video className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-start space-x-2">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold">
                        A
                      </div>
                      <div className="rounded-lg bg-muted p-2 text-sm">Hey! How's it going? 👋</div>
                    </div>
                    <div className="flex items-start space-x-2 justify-end">
                      <div className="rounded-lg bg-primary p-2 text-sm text-primary-foreground">
                        Great! Just trying out this new Hush app. It's amazing how secure it feels! 🔒
                      </div>
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                        Y
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold">
                        A
                      </div>
                      <div className="rounded-lg bg-muted p-2 text-sm">
                        I know right? End-to-end encryption means only we can see these messages!
                      </div>
                    </div>
                    <div className="flex items-start space-x-2 justify-end">
                      <div className="rounded-lg bg-primary p-2 text-sm text-primary-foreground">
                        That's exactly what I needed. Privacy without compromise. 👍
                      </div>
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                        Y
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-2 border-t">
                    <div className="rounded-full bg-muted p-2">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                    <div className="rounded-full bg-primary p-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-primary-foreground"
                      >
                        <path d="m22 2-7 20-4-9-9-4Z" />
                        <path d="M22 2 11 13" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Features</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Everything you need in a modern chat app
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Hush combines the best features of modern messaging with uncompromising security and privacy.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              <div className="grid gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Rich Messaging</h3>
                <p className="text-muted-foreground">Send text, photos, videos, files and voice messages with ease.</p>
              </div>
              <div className="grid gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto">
                  <Video className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Video Calls</h3>
                <p className="text-muted-foreground">Crystal clear, encrypted video calls with friends and groups.</p>
              </div>
              <div className="grid gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Group Chats</h3>
                <p className="text-muted-foreground">
                  Create groups with up to 1000 members with advanced admin controls.
                </p>
              </div>
              <div className="grid gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">End-to-End Encryption</h3>
                <p className="text-muted-foreground">
                  Your messages are encrypted from the moment you send them until they're received.
                </p>
              </div>
              <div className="grid gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-8 w-8 text-primary"
                  >
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Self-Destructing Messages</h3>
                <p className="text-muted-foreground">
                  Set messages to disappear after they've been read or after a set time.
                </p>
              </div>
              <div className="grid gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-8 w-8 text-primary"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Verified Security</h3>
                <p className="text-muted-foreground">
                  Our code is open source and regularly audited by security experts.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="security" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 px-10 md:gap-16 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-background px-3 py-1 text-sm">Security First</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Your privacy is our priority</h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                  Hush uses state-of-the-art encryption protocols to ensure your messages stay private. We can't read
                  your messages, and neither can anyone else.
                </p>
                <ul className="grid gap-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>End-to-end encryption by default</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>No metadata storage</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Open source and independently audited</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>No ads or tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Secure local storage with biometric protection</span>
                  </li>
                </ul>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" variant="outline" className="gap-1.5">
                    Learn about our security <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="relative flex items-center justify-center">
                <div className="absolute -top-8 -left-8 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="relative z-10 overflow-hidden rounded-xl border bg-background p-6 shadow-xl">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                        <Lock className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">End-to-End Encryption</h3>
                        <p className="text-sm text-muted-foreground">Only you and the recipient can read messages</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-2 w-[95%] rounded-full bg-primary"></div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Security Level</span>
                        <span>95%</span>
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5 text-primary"
                          >
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                            <path d="m9 12 2 2 4-4" />
                          </svg>
                          <span className="font-medium">Verified Security</span>
                        </div>
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-muted p-4 text-center">
                        <div className="text-2xl font-bold">0</div>
                        <div className="text-xs text-muted-foreground">Data breaches</div>
                      </div>
                      <div className="rounded-lg bg-muted p-4 text-center">
                        <div className="text-2xl font-bold">100%</div>
                        <div className="text-xs text-muted-foreground">Private</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Testimonials</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Loved by privacy-conscious users
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Don't just take our word for it. Here's what our users have to say about Hush.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-3">
              <div className="rounded-lg border bg-background p-6 shadow-sm">
                <div className="flex items-center space-x-4">
                  <Image
                    src="/placeholder.svg?height=40&width=40"
                    alt="User"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <h3 className="font-bold">Alex Thompson</h3>
                    <p className="text-sm text-muted-foreground">Journalist</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-muted-foreground">
                    "As a journalist, I need to protect my sources. Hush gives me the confidence that my communications
                    remain private and secure."
                  </p>
                </div>
                <div className="mt-4 flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5 text-primary"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border bg-background p-6 shadow-sm">
                <div className="flex items-center space-x-4">
                  <Image
                    src="/placeholder.svg?height=40&width=40"
                    alt="User"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <h3 className="font-bold">Sarah Chen</h3>
                    <p className="text-sm text-muted-foreground">Software Developer</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-muted-foreground">
                    "I've tried many messaging apps, but Hush stands out with its perfect balance of user-friendly
                    features and top-notch security. It's now my go-to app."
                  </p>
                </div>
                <div className="mt-4 flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5 text-primary"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border bg-background p-6 shadow-sm">
                <div className="flex items-center space-x-4">
                  <Image
                    src="/placeholder.svg?height=40&width=40"
                    alt="User"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <h3 className="font-bold">Michael Rodriguez</h3>
                    <p className="text-sm text-muted-foreground">Business Owner</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-muted-foreground">
                    "My team uses Hush for all our sensitive business communications. The group features and security
                    make it perfect for our needs."
                  </p>
                </div>
                <div className="mt-4 flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5 text-primary"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="download" className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-muted to-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Ready to take back your privacy?
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Download Hush today and experience secure messaging like never before.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" className="gap-1.5">
                  <Download className="h-5 w-5" />
                  Download for iOS
                </Button>
                <Button size="lg" variant="outline" className="gap-1.5">
                  <Download className="h-5 w-5" />
                  Download for Android
                </Button>
              </div>
              <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-sm">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Download className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Easy Setup</h3>
                  <p className="text-center text-muted-foreground">
                    Download, install, and start chatting securely in minutes.
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-sm">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-8 w-8 text-primary"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Always Free</h3>
                  <p className="text-center text-muted-foreground">
                    Hush is and will always be free. Privacy is a right, not a premium feature.
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-sm md:col-span-2 lg:col-span-1">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Invite Friends</h3>
                  <p className="text-center text-muted-foreground">
                    Bring your friends and family to Hush. The more people who use encrypted messaging, the safer
                    everyone is.
                  </p>
                </div>
              </div>
              <div className="mt-12 flex items-center justify-center space-x-4">
                <div className="text-sm text-muted-foreground">Available on</div>
                <div className="flex items-center space-x-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M12 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5.5" />
                    <path d="M16 19h6" />
                    <path d="M19 16v6" />
                  </svg>
                  <span>iOS</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <path d="M12 18h.01" />
                  </svg>
                  <span>Android</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" x2="16" y1="21" y2="21" />
                    <line x1="12" x2="12" y1="17" y2="21" />
                  </svg>
                  <span>Desktop</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t bg-background py-6">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 md:flex-row md:gap-8 md:px-6 mx-auto">
          <div className="flex items-center gap-2 text-lg font-bold">
            <Lock className="h-6 w-6 text-primary" />
            <span>Hush</span>
          </div>
          <nav className="flex gap-4 sm:gap-6">
            <Link href="#" className="text-sm font-medium hover:underline">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline">
              Contact
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline">
              About
            </Link>
          </nav>
          <div className="flex gap-4 md:ml-auto">
            <Link href="#" className="rounded-full p-2 hover:bg-muted">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="#" className="rounded-full p-2 hover:bg-muted">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
              <span className="sr-only">Facebook</span>
            </Link>
            <Link href="#" className="rounded-full p-2 hover:bg-muted">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              <span className="sr-only">Instagram</span>
            </Link>
          </div>
        </div>
        <div className="container mt-4 text-center text-sm text-muted-foreground mx-auto">
          &copy; {new Date().getFullYear()} Hush. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

