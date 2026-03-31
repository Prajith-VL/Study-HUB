"use client"

import Link from "next/link"
import type { Route } from "next"
import { useRouter, useSearchParams } from "next/navigation"
import { type FormEvent, useState } from "react"

import { Loader2 } from "lucide-react"

import { OAuthRow } from "@/components/auth/oauth-row"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const allowedRoutes = ["/dashboard", "/subjects", "/notes", "/planner", "/analytics", "/settings"] as const
  const requestedPath = searchParams.get("redirectTo")
  const redirectTo = (allowedRoutes.find((route) => route === requestedPath) ?? "/dashboard") as Route

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGooglePending, setIsGooglePending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") ?? "")
    const password = String(formData.get("password") ?? "")
    const supabase = createClient()

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (signInError) {
      setError(signInError.message)
      setIsSubmitting(false)
      return
    }

    router.replace(redirectTo)
    router.refresh()
  }

  async function handleGoogleAuth() {
    setError(null)
    setIsGooglePending(true)
    try {
      const supabase = createClient()
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      if (oauthError) {
        setError(oauthError.message)
        setIsGooglePending(false)
      }
    } catch (oauthError) {
      setError((oauthError as Error).message)
      setIsGooglePending(false)
    }
  }

  return (
    <Card className="mx-auto w-full max-w-[420px] border-white/10 bg-[#10111acc]/90">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-4xl font-semibold tracking-tight text-white md:text-[2.1rem]">Welcome Back</CardTitle>
        <CardDescription className="text-sm text-zinc-300">Enter your sanctuary of focus.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" name="email" type="email" required placeholder="scholar@ethereal.edu" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="#" className="text-xs font-medium text-cyan-300 hover:text-cyan-200">
                Forgot Password?
              </Link>
            </div>
            <Input id="password" name="password" type="password" required placeholder="••••••••" />
          </div>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          <Button
            type="submit"
            className="h-11 w-full rounded-full bg-[#b784ff] text-black hover:bg-[#c697ff] hover:shadow-[0_0_40px_-8px_#b784ff]"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Log In
          </Button>

          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3">
              <Separator className="bg-white/10" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Or continue with</span>
              <Separator className="bg-white/10" />
            </div>
            <OAuthRow onGoogle={() => void handleGoogleAuth()} isGooglePending={isGooglePending} />
          </div>

          <p className="pt-1 text-center text-sm text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-primary hover:text-primary/80">
              Sign Up
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
