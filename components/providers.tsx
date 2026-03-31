"use client"

import type { ReactNode } from "react"
import { ThemeProvider } from "next-themes"

import { ToastProvider } from "@/components/ui/toast"

type ProvidersProps = {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  )
}
