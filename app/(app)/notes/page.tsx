import { PageHeader } from "@/components/app-shell/page-header"
import { NotesBoard } from "@/components/notes/notes-board"
import { getNotes } from "@/lib/notes/queries"
import { getSubjects } from "@/lib/subjects/queries"

export default async function NotesPage() {
  const [notes, subjects] = await Promise.all([getNotes(), getSubjects()])

  return (
    <div className="space-y-8">
      <PageHeader
        title="Notes"
        subtitle="Markdown notes with autosave, pinning, tags, and subject organization."
      />
      <NotesBoard
        initialNotes={notes}
        subjects={subjects.map((subject) => ({ id: subject.id, name: subject.name }))}
      />
    </div>
  )
}