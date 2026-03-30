import { FoundationSection } from "@/components/app-shell/foundation-section"
import { PageHeader } from "@/components/app-shell/page-header"

export default function PlannerPage() {
  return (
    <div className="space-y-8 card-reveal">
      <PageHeader title="Planner" subtitle="Plan sessions, deadlines, and high-focus sprints." />
      <FoundationSection
        title="Planner Module Scaffold"
        description="Designed for calendar, task, and reminder systems."
        points={[
          "Task model can map directly to Supabase table rows.",
          "Supports priority, due date, and completion metadata.",
          "Prepared for drag-and-drop and timeline enhancements."
        ]}
      />
    </div>
  )
}

