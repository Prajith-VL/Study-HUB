"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"

type AppErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AppError({ error, reset }: AppErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="rounded-xl border border-red-400/20 bg-red-950/20 p-6">
      <h2 className="text-xl font-semibold text-white">Failed to load workspace</h2>
      <p className="mt-2 text-sm text-zinc-300">Refresh this section to recover.</p>
      <Button className="mt-4" onClick={reset}>
        Reload section
      </Button>
    </div>
  )
}

