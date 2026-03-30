import { FoundationSection } from "@/components/app-shell/foundation-section"
import { PageHeader } from "@/components/app-shell/page-header"

export default function NotesPage() {
  return (
    <div className="space-y-8 card-reveal">
      <PageHeader title="Notes" subtitle="Capture ideas, lecture summaries, and revision packs." />
      <FoundationSection
        title="Notes Module Scaffold"
        description="Configured for fast extension into rich editor workflows."
        points={[
          "Ready for markdown or block-style editor integration.",
          "Supports linking notes to subjects and planner tasks.",
          "Prepared for autosave and version history additions."
        ]}
      />
    </div>
  )
}

