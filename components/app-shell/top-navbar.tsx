"use client"

import { Menu, PanelLeft, UserCircle2 } from "lucide-react"

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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#0a0d15]/85 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onToggleMobile}>
          <Menu className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="hidden md:inline-flex" onClick={onToggleCollapse}>
          <PanelLeft className="h-4 w-4" />
        </Button>
        <p className="text-sm text-zinc-400">
          Signed in as <span className="font-medium text-zinc-200">{userEmail}</span>
        </p>
      </div>

      <div className="flex items-center gap-2">
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

