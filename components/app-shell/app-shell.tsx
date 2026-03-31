"use client"

import type { ReactNode } from "react"

import { AppSidebar } from "@/components/app-shell/app-sidebar"
import { GlobalShortcuts } from "@/components/app-shell/global-shortcuts"
import { ShellProvider, useShell } from "@/components/app-shell/shell-context"
import { TopNavbar } from "@/components/app-shell/top-navbar"
import { CommandPalette } from "@/components/command/command-palette"
import { cn } from "@/lib/utils"

type AppShellProps = {
  children: ReactNode
  userEmail: string
  logoutAction: () => Promise<void>
}

function ShellLayout({ children, userEmail, logoutAction }: AppShellProps) {
  const { isCollapsed, isMobileOpen, toggleCollapse, toggleMobile, closeMobile } = useShell()

  return (
    <div className="relative flex min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(132,92,255,0.15),transparent_35%),#080a10] text-zinc-50">
      <GlobalShortcuts />
      <CommandPalette />
      <AppSidebar collapsed={isCollapsed} onToggleCollapse={toggleCollapse} />

      {isMobileOpen ? (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={closeMobile}
            aria-label="Close sidebar overlay"
          />
          <div className="relative z-10">
            <AppSidebar collapsed={false} mobile onToggleCollapse={toggleCollapse} onNavigate={closeMobile} />
          </div>
        </div>
      ) : null}

      <div className={cn("flex min-h-screen min-w-0 flex-1 flex-col transition-[padding] duration-200")}>
        <TopNavbar
          userEmail={userEmail}
          onToggleCollapse={toggleCollapse}
          onToggleMobile={toggleMobile}
          logoutAction={logoutAction}
        />
        <main className="flex-1 overflow-x-hidden p-3 sm:p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}

export function AppShell(props: AppShellProps) {
  return (
    <ShellProvider>
      <ShellLayout {...props} />
    </ShellProvider>
  )
}
