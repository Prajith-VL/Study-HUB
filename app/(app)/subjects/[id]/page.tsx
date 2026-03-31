import Link from "next/link"
import type { Route } from "next"

import { NoteCreateModal } from "@/components/notes/note-create-modal"
import { ChecklistPanel } from "@/components/subject-workflow/checklist-panel"
import { SubjectDetailNav } from "@/components/subjects/subject-detail-nav"
import { VideoFormModal } from "@/components/videos/video-form-modal"
import { VideoProgressList } from "@/components/videos/video-progress-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getNotesBySubject } from "@/lib/notes/queries"
import { getSubjectById, getSubjectChecklists, getSubjectResources, getSubjects } from "@/lib/subjects/queries"
import { getVideosBySubject } from "@/lib/videos/queries"

type SubjectOverviewPageProps = {
  params: Promise<{ id: string }>
}

export default async function SubjectOverviewPage({ params }: SubjectOverviewPageProps) {
  const { id } = await params

  const [subject, resources, notes, videos, subjects, checklistItems] = await Promise.all([
    getSubjectById(id),
    getSubjectResources(id),
    getNotesBySubject(id, 6),
    getVideosBySubject(id),
    getSubjects(),
    getSubjectChecklists(id)
  ])

  const total = resources.length
  const links = resources.filter((resource) => !resource.storage_path).length
  const files = resources.filter((resource) => Boolean(resource.storage_path)).length
  const checklistCompletion = checklistItems.length
    ? Math.round((checklistItems.filter((item) => item.is_completed).length / checklistItems.length) * 100)
    : 0
  const subjectCompletion = Math.round(((subject?.progress ?? 0) + checklistCompletion) / 2)
  const examDaysLeft =
    subject?.exam_date ? Math.max(0, Math.ceil((+new Date(subject.exam_date) - +new Date()) / (1000 * 60 * 60 * 24))) : null

  return (
    <div className="space-y-5">
      <SubjectDetailNav subjectId={id} active="overview" />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-white/10 bg-white/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-white">{total}</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Links</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-white">{links}</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">PDF Files</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-white">{files}</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Subject Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-white">{subjectCompletion}%</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Exam Countdown</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-white">{examDaysLeft === null ? "-" : `${examDaysLeft}d`}</p>
          </CardContent>
        </Card>
      </div>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="border-white/10 bg-white/[0.03]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-white">Subject Notes</CardTitle>
            <NoteCreateModal
              subjects={subjects.map((subject) => ({ id: subject.id, name: subject.name }))}
              defaultSubjectId={id}
              triggerLabel="Add"
              compact
            />
          </CardHeader>
          <CardContent className="space-y-2">
            {!notes.length ? (
              <p className="text-sm text-zinc-500">No notes linked to this subject yet.</p>
            ) : (
              notes.map((note) => (
                <Link
                  key={note.id}
                  href={`/notes/${note.id}` as Route}
                  className="block rounded-lg border border-white/10 px-3 py-2 transition-colors hover:border-white/20 hover:bg-white/[0.04]"
                >
                  <p className="truncate text-sm font-medium text-white">{note.title}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{new Date(note.updated_at).toLocaleString()}</p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/[0.03]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-white">Video Progress</CardTitle>
            <VideoFormModal
              subjectId={id}
              notes={notes.map((note) => ({ id: note.id, title: note.title }))}
              label="Add"
              compact
            />
          </CardHeader>
          <CardContent>
            <VideoProgressList
              subjectId={id}
              videos={videos}
              notes={notes.map((note) => ({ id: note.id, title: note.title }))}
            />
          </CardContent>
        </Card>
      </section>

      <ChecklistPanel subjectId={id} items={checklistItems} />
    </div>
  )
}
