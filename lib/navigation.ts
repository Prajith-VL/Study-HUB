import type { LucideIcon } from "lucide-react"
import { BarChart3, BookOpen, CalendarCheck2, FileText, Focus, LayoutDashboard, Settings } from "lucide-react"

export type NavigationItem = {
  href: "/dashboard" | "/subjects" | "/notes" | "/planner" | "/analytics" | "/focus" | "/settings"
  label: string
  icon: LucideIcon
}

export const mainNavigation: NavigationItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/subjects", label: "Subjects", icon: BookOpen },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/planner", label: "Planner", icon: CalendarCheck2 },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/focus", label: "Focus Mode", icon: Focus },
  { href: "/settings", label: "Settings", icon: Settings }
]
