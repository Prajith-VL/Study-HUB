"use client"

import { Button } from "@/components/ui/button"

type SubjectDetailErrorProps = {
  reset: () => void
}

export default function SubjectDetailError({ reset }: SubjectDetailErrorProps) {
  return (
    <div className="rounded-2xl border border-red-400/20 bg-red-950/20 p-6">
      <h2 className="text-xl font-semibold text-white">Unable to load subject</h2>
      <p className="mt-2 text-sm text-zinc-300">Please retry. If this continues, verify your Supabase schema and policies.</p>
      <Button className="mt-4" onClick={reset}>
        Retry
      </Button>
    </div>
  )
}

