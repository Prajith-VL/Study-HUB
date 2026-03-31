"use client"

import Link from "next/link"
import type { Route } from "next"
import { useMemo, useOptimistic, useState } from "react"

import { Pencil, Plus, Search, Trash2 } from "lucide-react"

import { createSubject, deleteSubject, updateSubject } from "@/app/(app)/subjects/actions"
import { SubjectForm } from "@/components/subjects/subject-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { useToast } from "@/components/ui/toast"
import type { Subject } from "@/lib/subjects/types"

type SubjectFormValues = {
  id?: string
  name: string
  semester: string
  color: string
  progress: number
}

type OptimisticAction =
  | { type: "create"; subject: Subject }
  | { type: "update"; subject: Subject }
  | { type: "delete"; id: string }

function reduceSubjects(state: Subject[], action: OptimisticAction): Subject[] {
  if (action.type === "create") {
    return [action.subject, ...state]
  }
  if (action.type === "update") {
    return state.map((subject) => (subject.id === action.subject.id ? action.subject : subject))
  }
  return state.filter((subject) => subject.id !== action.id)
}

type SubjectsBoardProps = {
  initialSubjects: Subject[]
}

export function SubjectsBoard({ initialSubjects }: SubjectsBoardProps) {
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Subject | null>(null)
  const [subjects, applyOptimistic] = useOptimistic(initialSubjects, reduceSubjects)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return subjects
    return subjects.filter(
      (subject) => subject.name.toLowerCase().includes(query) || subject.semester.toLowerCase().includes(query)
    )
  }, [search, subjects])

  async function handleCreate(formData: FormData, optimisticValues: SubjectFormValues) {
    const tempId = `temp-${crypto.randomUUID()}`
    const now = new Date().toISOString()
    applyOptimistic({
      type: "create",
      subject: {
        id: tempId,
        user_id: "temp",
        created_at: now,
        name: String(formData.get("name") ?? optimisticValues.name),
        semester: String(formData.get("semester") ?? optimisticValues.semester),
        color: String(formData.get("color") ?? optimisticValues.color),
        progress: Number(formData.get("progress") ?? optimisticValues.progress),
        is_pinned: false,
        exam_date: null
      }
    })

    const result = await createSubject(formData)
    if (!result.success) {
      applyOptimistic({ type: "delete", id: tempId })
      toast({ title: "Could not create subject", description: result.error, variant: "error" })
      return
    }

    applyOptimistic({ type: "delete", id: tempId })
    applyOptimistic({ type: "create", subject: result.data })
    setCreateOpen(false)
    toast({ title: "Subject created", variant: "success" })
  }

  async function handleUpdate(formData: FormData, optimisticValues: SubjectFormValues) {
    if (!editing) return

    applyOptimistic({
      type: "update",
      subject: {
        ...editing,
        name: String(formData.get("name") ?? optimisticValues.name),
        semester: String(formData.get("semester") ?? optimisticValues.semester),
        color: String(formData.get("color") ?? optimisticValues.color),
        progress: Number(formData.get("progress") ?? optimisticValues.progress)
      }
    })

    const result = await updateSubject(formData)
    if (!result.success) {
      applyOptimistic({ type: "update", subject: editing })
      toast({ title: "Could not update subject", description: result.error, variant: "error" })
      return
    }

    applyOptimistic({ type: "update", subject: result.data })
    setEditing(null)
    toast({ title: "Subject updated", variant: "success" })
  }

  async function handleDelete(subject: Subject) {
    const formData = new FormData()
    formData.set("id", subject.id)
    applyOptimistic({ type: "delete", id: subject.id })
    const result = await deleteSubject(formData)

    if (!result.success) {
      applyOptimistic({ type: "create", subject })
      toast({ title: "Could not delete subject", description: result.error, variant: "error" })
      return
    }

    toast({ title: "Subject deleted", variant: "success" })
  }

  return (
    <div className="space-y-6 card-reveal">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search subjects..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="h-11 rounded-full bg-[#b784ff] px-5 text-black hover:bg-[#c697ff] hover:shadow-[0_0_30px_-8px_#b784ff]"
        >
          <Plus className="h-4 w-4" />
          New Subject
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-white/10 bg-white/[0.03]">
          <CardContent className="flex min-h-60 flex-col items-center justify-center gap-3 text-center">
            <p className="text-xl font-semibold text-white">{subjects.length ? "No subject matches your search" : "No subjects yet"}</p>
            <p className="max-w-md text-sm text-zinc-400">
              {subjects.length
                ? "Try another keyword for subject name or semester."
                : "Create your first subject to start managing resources, syllabus, and progress."}
            </p>
            {!subjects.length ? (
              <Button onClick={() => setCreateOpen(true)} className="rounded-full bg-[#b784ff] text-black hover:bg-[#c697ff]">
                Create Subject
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((subject) => (
            <Card
              key={subject.id}
              className="group overflow-hidden border-white/10 bg-white/[0.03] transition-transform duration-200 hover:-translate-y-0.5 hover:border-white/20"
              style={{ boxShadow: `0 0 0 1px ${subject.color}25 inset` }}
            >
              <CardContent className="p-5">
                <div className="mb-4 flex items-start justify-between">
                  <div className="min-w-0">
                    <div className="inline-flex items-center rounded-full border border-white/10 px-2 py-1 text-xs text-zinc-300">
                      {subject.semester}
                    </div>
                    <h3 className="mt-2 truncate text-lg font-semibold text-white">{subject.name}</h3>
                  </div>
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: subject.color }} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Progress</span>
                    <span className="text-white">{subject.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-800">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ width: `${subject.progress}%`, backgroundColor: subject.color }}
                    />
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <Button asChild variant="secondary" className="h-9 min-w-0 flex-1 bg-white/10 hover:bg-white/20">
                    <Link href={`/subjects/${subject.id}` as Route}>Open</Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-300 hover:bg-white/10" onClick={() => setEditing(subject)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-red-300 hover:bg-red-500/20"
                    onClick={() => void handleDelete(subject)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Subject"
        description="Add a new subject card to your workspace."
      >
        <SubjectForm submitLabel="Create Subject" onSubmit={handleCreate} />
      </Modal>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Edit Subject"
        description="Update metadata, color, and progress."
      >
        {editing ? <SubjectForm initialValues={editing} submitLabel="Save Changes" onSubmit={handleUpdate} /> : null}
      </Modal>
    </div>
  )
}
