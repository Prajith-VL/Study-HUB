"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { mainNavigation } from "@/lib/navigation"

type AppSidebarProps = {
  collapsed: boolean
  mobile?: boolean
  onToggleCollapse: () => void
  onNavigate?: () => void
}

export function AppSidebar({ collapsed, mobile = false, onToggleCollapse, onNavigate }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "relative hidden h-screen shrink-0 flex-col border-r border-white/10 bg-[#0d0f16]/95 p-3 backdrop-blur md:flex",
        mobile ? "flex w-[260px]" : "",
        collapsed ? "w-[88px]" : "w-[260px]"
      )}
    >
      <div className={cn("mb-6 flex items-center", collapsed ? "justify-center" : "justify-between px-2")}>
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-primary">
          <Sparkles className="h-4 w-4 shrink-0" />
          {!collapsed ? <span className="text-sm font-semibold tracking-wide">Ethereal Study Hub</span> : null}
        </Link>
        {!collapsed ? (
          <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="h-8 w-8 text-zinc-300">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      {collapsed ? (
        <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="mb-5 h-9 w-9 self-center text-zinc-300">
          <ChevronRight className="h-4 w-4" />
        </Button>
      ) : null}

      <nav className="space-y-1">
        {mainNavigation.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "group flex h-10 items-center rounded-lg px-3 text-sm transition-colors",
                isActive ? "bg-primary/20 text-primary" : "text-zinc-300 hover:bg-white/5 hover:text-white",
                collapsed ? "justify-center px-0" : "gap-3"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-zinc-400 group-hover:text-zinc-200")} />
              {!collapsed ? <span>{label}</span> : null}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
