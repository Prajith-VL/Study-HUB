"use client"

import type { ReactNode } from "react"
import { createContext, useContext, useMemo, useState } from "react"

type ShellContextValue = {
  isCollapsed: boolean
  isMobileOpen: boolean
  toggleCollapse: () => void
  toggleMobile: () => void
  closeMobile: () => void
}

const ShellContext = createContext<ShellContextValue | null>(null)

type ShellProviderProps = {
  children: ReactNode
}

export function ShellProvider({ children }: ShellProviderProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const value = useMemo<ShellContextValue>(
    () => ({
      isCollapsed,
      isMobileOpen,
      toggleCollapse: () => setIsCollapsed((value) => !value),
      toggleMobile: () => setIsMobileOpen((value) => !value),
      closeMobile: () => setIsMobileOpen(false)
    }),
    [isCollapsed, isMobileOpen]
  )

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>
}

export function useShell() {
  const context = useContext(ShellContext)
  if (!context) {
    throw new Error("useShell must be used within ShellProvider.")
  }
  return context
}
