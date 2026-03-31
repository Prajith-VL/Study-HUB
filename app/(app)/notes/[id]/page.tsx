import { notFound } from "next/navigation"

import { PageHeader } from "@/components/app-shell/page-header"
import { NoteEditor } from "@/components/notes/note-editor"
import { getNoteById } from "@/lib/notes/queries"
import { getSubjects } from "@/lib/subjects/queries"

type NoteDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function NoteDetailPage({ params }: NoteDetailPageProps) {
  const { id } = await params
  const [note, subjects] = await Promise.all([getNoteById(id), getSubjects()])
  if (!note) notFound()

  return (
    <div className="space-y-8">
      <PageHeader title="Note Editor" subtitle="Markdown editing with autosave and keyboard-first flow." />
      <NoteEditor note={note} subjects={subjects.map((subject) => ({ id: subject.id, name: subject.name }))} />
    </div>
  )
}

