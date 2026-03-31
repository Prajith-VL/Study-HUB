"use client"

import { useEffect, useState, useTransition } from "react"

import { CalendarPlus, Loader2 } from "lucide-react"

import { createTask, updateTask } from "@/app/(app)/planner/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { useToast } from "@/components/ui/toast"
import { TASK_PRIORITIES, TASK_STATUSES, type Task } from "@/lib/planner/types"

type SubjectOption = { id: string; name: string }

type TaskFormModalProps = {
  subjects: SubjectOption[]
  initialTask?: Task
  defaultSubjectId?: string
  label?: string
  compact?: boolean
}

export function TaskFormModal({ subjects, initialTask, defaultSubjectId, label = "Add Task", compact = false }: TaskFormModalProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [defaultRevisionRound, setDefaultRevisionRound] = useState("1")
  const { toast } = useToast()
  const edit = Boolean(initialTask)

  useEffect(() => {
    if (edit) return
    const saved = localStorage.getItem("studyhub_default_revision_round")
    if (saved) {
      setDefaultRevisionRound(saved)
    }
  }, [edit])

  if (!subjects.length) {
    return (
      <Button disabled variant="secondary" className="bg-white/10">
        Add a subject first
      </Button>
    )
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className={compact ? "h-9 rounded-full bg-[#b784ff] px-3 text-black hover:bg-[#c697ff]" : "h-10 rounded-full bg-[#b784ff] text-black hover:bg-[#c697ff]"}
      >
        <CalendarPlus className="h-4 w-4" />
        {label}
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title={edit ? "Edit Task" : "Create Task"} description="Plan and track your revision workflow.">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            const formData = new FormData(event.currentTarget)
            startTransition(async () => {
              const result = edit ? await updateTask(formData) : await createTask(formData)
              if (!result.success) {
                toast({ title: edit ? "Could not update task" : "Could not create task", description: result.error, variant: "error" })
                return
              }
              toast({ title: edit ? "Task updated" : "Task created", variant: "success" })
              setOpen(false)
            })
          }}
        >
          {edit ? <input type="hidden" name="id" value={initialTask?.id} /> : null}

          <div className="space-y-2">
            <Label htmlFor="task-subject">Subject</Label>
            <select
              id="task-subject"
              name="subjectId"
              defaultValue={initialTask?.subject_id ?? defaultSubjectId ?? subjects[0]?.id}
              className="flex h-11 w-full rounded-md border border-border/60 bg-black/60 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
            >
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-title">Task</Label>
            <Input id="task-title" name="title" defaultValue={initialTask?.title ?? ""} placeholder="Revise sorting algorithms" required />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="task-dueDate">Due Date</Label>
              <Input
                id="task-dueDate"
                name="dueDate"
                type="datetime-local"
                defaultValue={initialTask?.due_date ? new Date(initialTask.due_date).toISOString().slice(0, 16) : ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-revision">Revision Round</Label>
              <Input
                id="task-revision"
                name="revisionRound"
                type="number"
                min={1}
                defaultValue={initialTask?.revision_round ?? defaultRevisionRound}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="task-priority">Priority</Label>
              <select
                id="task-priority"
                name="priority"
                defaultValue={initialTask?.priority ?? "medium"}
                className="flex h-11 w-full rounded-md border border-border/60 bg-black/60 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
              >
                {TASK_PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-status">Status</Label>
              <select
                id="task-status"
                name="status"
                defaultValue={initialTask?.status ?? "todo"}
                className="flex h-11 w-full rounded-md border border-border/60 bg-black/60 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
              >
                {TASK_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button type="submit" disabled={isPending} className="h-11 w-full rounded-full bg-[#b784ff] text-black hover:bg-[#c697ff]">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {edit ? "Save Task" : "Create Task"}
          </Button>
        </form>
      </Modal>
    </>
  )
}
