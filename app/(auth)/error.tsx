"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"

type AuthErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AuthError({ error, reset }: AuthErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto w-full max-w-[420px] rounded-2xl border border-red-400/20 bg-red-950/20 p-6 text-center">
      <h2 className="text-xl font-semibold text-white">Unable to load auth page</h2>
      <p className="mt-2 text-sm text-zinc-300">Please retry. If this persists, check your environment variables.</p>
      <Button className="mt-5" onClick={reset}>
        Retry
      </Button>
    </div>
  )
}

