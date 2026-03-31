"use client"

import { Command, Menu, PanelLeft, UserCircle2 } from "lucide-react"

import { LogoutForm } from "@/components/app-shell/logout-form"
import { ThemeToggle } from "@/components/app-shell/theme-toggle"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type TopNavbarProps = {
  userEmail: string
  onToggleCollapse: () => void
  onToggleMobile: () => void
  logoutAction: () => Promise<void>
}

export function TopNavbar({ userEmail, onToggleCollapse, onToggleMobile, logoutAction }: TopNavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-2 border-b border-white/10 bg-[#0a0d15]/85 px-3 backdrop-blur sm:px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onToggleMobile}>
          <Menu className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="hidden md:inline-flex" onClick={onToggleCollapse}>
          <PanelLeft className="h-4 w-4" />
        </Button>
        <p className="min-w-0 truncate text-xs text-zinc-400 sm:text-sm">
          <span className="hidden sm:inline">Signed in as </span>
          <span className="font-medium text-zinc-200">{userEmail}</span>
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
        >
          <Command className="h-4 w-4" />
          <span className="sr-only">Open search</span>
        </Button>
        <Button
          variant="ghost"
          className="hidden h-9 rounded-full border border-white/10 bg-white/5 px-3 text-xs text-zinc-300 md:inline-flex"
          onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
        >
          <Command className="h-3.5 w-3.5" />
          Search
          <span className="ml-1 rounded border border-white/20 px-1 text-[10px] text-zinc-400">Ctrl+K</span>
        </Button>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full border border-white/10 bg-white/5">
              <UserCircle2 className="h-5 w-5" />
              <span className="sr-only">Account menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-white/10 bg-[#12131c]">
            <DropdownMenuItem className="cursor-default text-zinc-400 focus:bg-transparent focus:text-zinc-400">
              {userEmail}
            </DropdownMenuItem>
            <LogoutForm action={logoutAction} />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
