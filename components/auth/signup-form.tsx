"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { type FormEvent, useState } from "react"

import { Loader2 } from "lucide-react"

import { OAuthRow } from "@/components/auth/oauth-row"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"

export function SignupForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGooglePending, setIsGooglePending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const fullName = String(formData.get("fullName") ?? "")
    const email = String(formData.get("email") ?? "")
    const password = String(formData.get("password") ?? "")
    const supabase = createClient()

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })

    if (signUpError) {
      setError(signUpError.message)
      setIsSubmitting(false)
      return
    }

    setSuccess("Account created. Check your email to verify, then log in.")
    setIsSubmitting(false)
    setTimeout(() => {
      router.push("/login")
    }, 1500)
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
        <CardTitle className="text-4xl font-semibold tracking-tight text-white md:text-[2.1rem]">Create your sanctuary</CardTitle>
        <CardDescription className="text-sm text-zinc-300">Start your journey into deep focus and academic excellence.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" name="fullName" type="text" required placeholder="Elias Vance" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" name="email" type="email" required placeholder="elias@studyhub.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required minLength={8} placeholder="••••••••" />
          </div>

          <p className="text-xs text-zinc-400">
            I agree to the{" "}
            <Link href="#" className="text-primary hover:text-primary/80">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-primary hover:text-primary/80">
              Privacy Policy
            </Link>
            .
          </p>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-300">{success}</p> : null}

          <Button
            type="submit"
            className="h-11 w-full rounded-full bg-[#b784ff] text-black hover:bg-[#c697ff] hover:shadow-[0_0_40px_-8px_#b784ff]"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Create Account
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
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:text-primary/80">
              Log In
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
