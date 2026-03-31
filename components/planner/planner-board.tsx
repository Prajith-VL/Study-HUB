"use client"

import { useMemo, useOptimistic, useState } from "react"

import { CheckCircle2, Circle, Clock3, Edit3, Trash2 } from "lucide-react"

import { deleteTask, reorderTasksByPriority, setTaskStatus } from "@/app/(app)/planner/actions"
import { TaskFormModal } from "@/components/planner/task-form-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"
import type { Task } from "@/lib/planner/types"

type SubjectOption = { id: string; name: string }
type TaskWithSubject = Task & { subjects?: { name: string } | null }

type OptimisticAction =
  | { type: "delete"; id: string }
  | { type: "restore"; task: TaskWithSubject }
  | { type: "status"; id: string; status: Task["status"] }

function reduceTasks(state: TaskWithSubject[], action: OptimisticAction) {
  if (action.type === "delete") return state.filter((task) => task.id !== action.id)
  if (action.type === "restore") return [...state, action.task].sort((a, b) => +new Date(a.due_date) - +new Date(b.due_date))
  return state.map((task) => (task.id === action.id ? { ...task, status: action.status } : task))
}

function dateKey(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

type PlannerBoardProps = {
  initialTasks: TaskWithSubject[]
  subjects: SubjectOption[]
}

export function PlannerBoard({ initialTasks, subjects }: PlannerBoardProps) {
  const [tasks, applyOptimistic] = useOptimistic(initialTasks, reduceTasks)
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "todo" | "in_progress" | "completed" | "overdue">("all")
  const { toast } = useToast()

  const grouped = useMemo(() => {
    const map = new Map<string, TaskWithSubject[]>()
    const filteredTasks = tasks.filter((task) => {
      if (filter === "all") return true
      if (filter === "overdue") return task.status !== "completed" && +new Date(task.due_date) < Date.now()
      return task.status === filter
    })

    filteredTasks.forEach((task) => {
      const key = dateKey(task.due_date)
      const arr = map.get(key) ?? []
      arr.push(task)
      map.set(key, arr)
    })
    return Array.from(map.entries()).sort((a, b) => +new Date(a[0]) - +new Date(b[0]))
  }, [filter, tasks])

  async function handleDelete(task: TaskWithSubject) {
    const fd = new FormData()
    fd.set("id", task.id)
    applyOptimistic({ type: "delete", id: task.id })
    const result = await deleteTask(fd)
    if (!result.success) {
      applyOptimistic({ type: "restore", task })
      toast({ title: "Could not delete task", description: result.error, variant: "error" })
      return
    }
    toast({ title: "Task deleted", variant: "success" })
  }

  async function handleStatus(task: TaskWithSubject, status: Task["status"]) {
    const previous = task.status
    applyOptimistic({ type: "status", id: task.id, status })
    const fd = new FormData()
    fd.set("id", task.id)
    fd.set("status", status)
    const result = await setTaskStatus(fd)
    if (!result.success) {
      applyOptimistic({ type: "status", id: task.id, status: previous })
      toast({ title: "Could not update status", description: result.error, variant: "error" })
      return
    }
  }

  async function handleDrop(targetTaskId: string) {
    if (!draggingTaskId || draggingTaskId === targetTaskId) return
    const taskIds = tasks.map((task) => task.id)
    const fromIndex = taskIds.indexOf(draggingTaskId)
    const toIndex = taskIds.indexOf(targetTaskId)
    if (fromIndex < 0 || toIndex < 0) return

    const reordered = [...taskIds]
    const [moved] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, moved)

    const result = await reorderTasksByPriority({ ids: reordered })
    if (!result.success) {
      toast({ title: "Reorder failed", description: result.error, variant: "error" })
      return
    }
    toast({ title: "Task order updated", variant: "success" })
  }

  if (!tasks.length) {
    return (
      <Card className="border-white/10 bg-white/[0.03]">
        <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
          <p className="text-xl font-semibold text-white">No tasks yet</p>
          <p className="text-sm text-zinc-400">Create your first task to start planning revision rounds.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 card-reveal">
      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "All" },
          { key: "todo", label: "To Do" },
          { key: "in_progress", label: "In Progress" },
          { key: "completed", label: "Completed" },
          { key: "overdue", label: "Overdue" }
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key as typeof filter)}
            className={`rounded-full border px-3 py-1 text-xs ${
              filter === item.key
                ? "border-primary/40 bg-primary/20 text-primary"
                : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {grouped.map(([key, dayTasks]) => (
        <section key={key} className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">{new Date(key).toDateString()}</h3>
          <div className="space-y-3">
            {dayTasks.map((task) => {
              const due = new Date(task.due_date)
              const overdue = task.status !== "completed" && due.getTime() < Date.now()
              return (
                <Card
                  key={task.id}
                  draggable
                  onDragStart={() => setDraggingTaskId(task.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => void handleDrop(task.id)}
                  className={`border-white/10 bg-white/[0.03] transition-colors ${overdue ? "border-red-500/30 bg-red-500/[0.08]" : "hover:border-white/20"}`}
                >
                  <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-white">{task.title}</p>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-400">
                        <span className="rounded-full border border-white/10 px-2 py-0.5">{task.subjects?.name ?? "Subject"}</span>
                        <span className="rounded-full border border-white/10 px-2 py-0.5">Priority: {task.priority}</span>
                        <span className="rounded-full border border-white/10 px-2 py-0.5">Round {task.revision_round}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-white/10 px-2 py-1 text-xs text-zinc-300">
                        <Clock3 className="h-3.5 w-3.5" />
                        <span className="truncate">{due.toLocaleString()}</span>
                      </span>
                      {task.status !== "completed" ? (
                        <Button variant="secondary" className="h-8 bg-white/10 hover:bg-white/20 sm:min-w-fit" onClick={() => void handleStatus(task, "completed")}>
                          <CheckCircle2 className="h-4 w-4" />
                          Complete
                        </Button>
                      ) : (
                        <Button variant="secondary" className="h-8 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 sm:min-w-fit" onClick={() => void handleStatus(task, "todo")}>
                          <Circle className="h-4 w-4" />
                          Reopen
                        </Button>
                      )}
                      <TaskFormModal subjects={subjects} initialTask={task} label="Edit" compact />
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-300 hover:bg-red-500/20" onClick={() => void handleDelete(task)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
