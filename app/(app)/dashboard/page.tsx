import { FoundationSection } from "@/components/app-shell/foundation-section"
import { PageHeader } from "@/components/app-shell/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const quickStats = [
  { label: "Active Subjects", value: "0" },
  { label: "Notes Created", value: "0" },
  { label: "Planned Tasks", value: "0" }
]

export default function DashboardPage() {
  return (
    <div className="space-y-8 card-reveal">
      <PageHeader title="Dashboard" subtitle="Your central hub for focus, planning, and learning velocity." />

      <section className="grid gap-4 md:grid-cols-3">
        {quickStats.map((stat) => (
          <Card key={stat.label} className="border-white/10 bg-white/[0.03]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-white">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <FoundationSection
          title="Day 1 Foundation Completed"
          description="Core modules are scaffolded with strict server/client boundaries."
          points={[
            "Supabase session-based auth is active with route protection.",
            "Reusable shell components support future CRUD modules.",
            "Module routes are structured for incremental expansion."
          ]}
        />
        <FoundationSection
          title="Next Build Targets"
          description="Recommended progression for Day 2 and Day 3 implementation."
          points={[
            "Subjects CRUD with ownership and RLS policy setup.",
            "Notes editor with markdown and autosave flow.",
            "Planner task timeline + analytics event ingestion."
          ]}
        />
      </section>
    </div>
  )
}

