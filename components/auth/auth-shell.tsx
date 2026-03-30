import Link from "next/link"
import type { ReactNode } from "react"

import { Sparkles } from "lucide-react"

type AuthShellProps = {
  children: ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(141,92,255,0.25),transparent_42%),radial-gradient(circle_at_85%_75%,rgba(32,214,255,0.18),transparent_34%),linear-gradient(180deg,#05060b_0%,#090b14_100%)]" />
      <div className="absolute inset-0 opacity-50 [background:radial-gradient(circle_at_center,rgba(255,255,255,0.06)_0,rgba(255,255,255,0.01)_24%,transparent_56%)]" />
      <div className="absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/25 blur-[140px]" />

      <div className="relative z-10 w-full max-w-[440px]">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          <Sparkles className="h-4 w-4" />
          Ethereal Study Hub
        </Link>
        {children}
      </div>
    </div>
  )
}
