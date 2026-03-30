"use client"

import { useEffect } from "react"

import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"

type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <AlertTriangle className="h-10 w-10 text-red-300" />
      <h2 className="text-2xl font-semibold text-white">Something went wrong</h2>
      <p className="max-w-sm text-sm text-zinc-400">A critical error occurred while rendering this page.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}

