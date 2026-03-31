"use client"

import { useOptimistic, useState, useTransition } from "react"

import { Loader2, Plus, Trash2 } from "lucide-react"

import { createChecklistItem, deleteChecklistItem, toggleChecklistItem } from "@/app/(app)/subjects/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"

type ChecklistItem = {
  id: string
  checklist_type: "topic" | "revision" | "syllabus"
  title: string
  unit_label: string | null
  is_completed: boolean
}

type ChecklistPanelProps = {
  subjectId: string
  items: ChecklistItem[]
}

type Action =
  | { type: "toggle"; id: string; isCompleted: boolean }
  | { type: "delete"; id: string }
  | { type: "add"; item: ChecklistItem }

function reducer(state: ChecklistItem[], action: Action) {
  if (action.type === "toggle") return state.map((item) => (item.id === action.id ? { ...item, is_completed: action.isCompleted } : item))
  if (action.type === "delete") return state.filter((item) => item.id !== action.id)
  return [...state, action.item]
}

export function ChecklistPanel({ subjectId, items }: ChecklistPanelProps) {
  const [optimistic, applyOptimistic] = useOptimistic(items, reducer)
  const [title, setTitle] = useState("")
  const [type, setType] = useState<"topic" | "revision" | "syllabus">("topic")
  const [unitLabel, setUnitLabel] = useState("")
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const grouped = {
    topic: optimistic.filter((item) => item.checklist_type === "topic"),
    revision: optimistic.filter((item) => item.checklist_type === "revision"),
    syllabus: optimistic.filter((item) => item.checklist_type === "syllabus")
  }

  const syllabusCompletion = grouped.syllabus.length
    ? Math.round((grouped.syllabus.filter((item) => item.is_completed).length / grouped.syllabus.length) * 100)
    : 0

  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardHeader>
        <CardTitle className="text-white">Study Workflow Checklists</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-4">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Checklist item" className="sm:col-span-2" />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
            className="h-11 rounded-md border border-white/10 bg-black/40 px-3 text-sm text-zinc-200"
          >
            <option value="topic">Topic</option>
            <option value="revision">Revision</option>
            <option value="syllabus">Syllabus Unit</option>
          </select>
          <Input value={unitLabel} onChange={(e) => setUnitLabel(e.target.value)} placeholder="Unit (optional)" />
        </div>
        <Button
          disabled={isPending || title.trim().length < 2}
          className="rounded-full bg-[#b784ff] text-black hover:bg-[#c697ff]"
          onClick={() =>
            startTransition(async () => {
              const formData = new FormData()
              formData.set("subjectId", subjectId)
              formData.set("title", title)
              formData.set("checklistType", type)
              formData.set("unitLabel", unitLabel)
              const result = await createChecklistItem(formData)
              if (!result.success) {
                toast({ title: "Could not add checklist item", description: result.error, variant: "error" })
                return
              }
              applyOptimistic({
                type: "add",
                item: {
                  id: result.data.id,
                  checklist_type: type,
                  title,
                  unit_label: unitLabel || null,
                  is_completed: false
                }
              })
              setTitle("")
              setUnitLabel("")
            })
          }
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add Item
        </Button>

        <div className="rounded-lg border border-white/10 p-3">
          <p className="text-sm text-zinc-400">Syllabus unit completion</p>
          <div className="mt-2 h-2 rounded-full bg-zinc-800">
            <div className="h-2 rounded-full bg-primary" style={{ width: `${syllabusCompletion}%` }} />
          </div>
          <p className="mt-1 text-xs text-zinc-500">{syllabusCompletion}% completed</p>
        </div>

        {(["topic", "revision", "syllabus"] as const).map((key) => (
          <div key={key} className="space-y-2">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{key} checklist</p>
            {!grouped[key].length ? (
              <p className="rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-500">No items yet.</p>
            ) : (
              grouped[key].map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2">
                  <label className="inline-flex items-center gap-2 text-sm text-zinc-200">
                    <input
                      type="checkbox"
                      checked={item.is_completed}
                      onChange={async (e) => {
                        applyOptimistic({ type: "toggle", id: item.id, isCompleted: e.target.checked })
                        const fd = new FormData()
                        fd.set("id", item.id)
                        fd.set("subjectId", subjectId)
                        fd.set("isCompleted", String(e.target.checked))
                        const result = await toggleChecklistItem(fd)
                        if (!result.success) {
                          applyOptimistic({ type: "toggle", id: item.id, isCompleted: item.is_completed })
                        }
                      }}
                      className="accent-primary"
                    />
                    <span>{item.title}</span>
                    {item.unit_label ? <span className="text-xs text-zinc-500">({item.unit_label})</span> : null}
                  </label>
                  <button
                    type="button"
                    className="rounded-md p-1 text-red-300 hover:bg-red-500/20"
                    onClick={async () => {
                      applyOptimistic({ type: "delete", id: item.id })
                      const fd = new FormData()
                      fd.set("id", item.id)
                      fd.set("subjectId", subjectId)
                      const result = await deleteChecklistItem(fd)
                      if (!result.success) {
                        toast({ title: "Delete failed", description: result.error, variant: "error" })
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

