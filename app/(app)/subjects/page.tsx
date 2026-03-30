import { FoundationSection } from "@/components/app-shell/foundation-section"
import { PageHeader } from "@/components/app-shell/page-header"

export default function SubjectsPage() {
  return (
    <div className="space-y-8 card-reveal">
      <PageHeader title="Subjects" subtitle="Organize all courses, goals, and study tracks in one place." />
      <FoundationSection
        title="Subjects Module Scaffold"
        description="This route is ready for Supabase-backed CRUD integration."
        points={[
          "Create subject entities with title, credits, and semester.",
          "Attach progress metadata and milestone checkpoints.",
          "Connect notes and planner tasks via relational IDs."
        ]}
      />
    </div>
  )
}

