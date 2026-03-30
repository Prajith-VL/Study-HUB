import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google"

import { Providers } from "@/components/providers"

import "./globals.css"

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans"
})

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading"
})

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
      <body className={`${jakarta.variable} ${grotesk.variable} min-h-screen font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
