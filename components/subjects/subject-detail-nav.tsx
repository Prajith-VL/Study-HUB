import Link from "next/link"
import type { Route } from "next"

import { cn } from "@/lib/utils"

type SubjectDetailNavProps = {
  subjectId: string
  active: "overview" | "resources" | "syllabus"
}

export function SubjectDetailNav({ subjectId, active }: SubjectDetailNavProps) {
  const tabs: Array<{ id: "overview" | "resources" | "syllabus"; label: string; href: Route }> = [
    { id: "overview", label: "Overview", href: `/subjects/${subjectId}` as Route },
    { id: "resources", label: "Resources", href: `/subjects/${subjectId}/resources` as Route },
    { id: "syllabus", label: "Syllabus", href: `/subjects/${subjectId}/syllabus` as Route }
  ]

  return (
    <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm transition-colors",
            active === tab.id ? "bg-primary/20 text-primary" : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}

