import type { Metadata } from "next"
import type { ReactNode } from "react"

import { Providers } from "@/components/providers"

import "./globals.css"

export const metadata: Metadata = {
  title: "Study Hub SaaS",
  description: "Focused, modular academic productivity workspace."
}

type RootLayoutProps = {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
