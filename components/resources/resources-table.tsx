"use client"

import { useOptimistic } from "react"

import { ExternalLink, FileText, Star, Trash2 } from "lucide-react"

import { deleteResource, toggleResourceFavorite } from "@/app/(app)/subjects/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"

type ResourceView = {
  id: string
  subjectId: string
  title: string
  typeLabel: string
  priorityLabel: string
  unitLabel: string | null
  topicLabel: string | null
  url: string | null
  createdAt: string
  isFavorite: boolean
}

type ResourcesTableProps = {
  resources: ResourceView[]
}

type DeleteAction =
  | { type: "delete"; id: string }
  | { type: "restore"; item: ResourceView }
  | { type: "favorite"; id: string; isFavorite: boolean }

function reduceResources(state: ResourceView[], action: DeleteAction) {
  if (action.type === "delete") return state.filter((item) => item.id !== action.id)
  if (action.type === "favorite") {
    return state.map((item) => (item.id === action.id ? { ...item, isFavorite: action.isFavorite } : item))
  }
  return [action.item, ...state]
}

export function ResourcesTable({ resources }: ResourcesTableProps) {
  const { toast } = useToast()
  const [optimistic, applyOptimistic] = useOptimistic(resources, reduceResources)

  async function handleDelete(item: ResourceView) {
    const formData = new FormData()
    formData.set("id", item.id)
    formData.set("subjectId", item.subjectId)
    applyOptimistic({ type: "delete", id: item.id })
    const result = await deleteResource(formData)

    if (!result.success) {
      applyOptimistic({ type: "restore", item })
      toast({ title: "Could not delete resource", description: result.error, variant: "error" })
      return
    }

    toast({ title: "Resource deleted", variant: "success" })
  }

  async function handleFavorite(item: ResourceView) {
    const next = !item.isFavorite
    applyOptimistic({ type: "favorite", id: item.id, isFavorite: next })
    const formData = new FormData()
    formData.set("id", item.id)
    formData.set("subjectId", item.subjectId)
    formData.set("isFavorite", String(next))
    const result = await toggleResourceFavorite(formData)
    if (!result.success) {
      applyOptimistic({ type: "favorite", id: item.id, isFavorite: item.isFavorite })
      toast({ title: "Could not update favorite", description: result.error, variant: "error" })
      return
    }
  }

  if (!optimistic.length) {
    return (
      <Card className="border-white/10 bg-white/[0.03]">
        <CardContent className="flex min-h-52 flex-col items-center justify-center gap-2 text-center">
          <p className="text-lg font-semibold text-white">No resources found</p>
          <p className="text-sm text-zinc-400">Add your first link or PDF to populate this vault.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {optimistic.map((item) => (
        <Card key={item.id} className="border-white/10 bg-white/[0.03] transition-colors hover:border-white/20">
          <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-white">{item.title}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                <span className="rounded-full border border-white/10 px-2 py-0.5">{item.typeLabel}</span>
                <span className="rounded-full border border-white/10 px-2 py-0.5">Priority: {item.priorityLabel}</span>
                {item.unitLabel ? <span className="rounded-full border border-white/10 px-2 py-0.5">{item.unitLabel}</span> : null}
                {item.topicLabel ? <span className="rounded-full border border-white/10 px-2 py-0.5">{item.topicLabel}</span> : null}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 ${item.isFavorite ? "text-yellow-300 hover:bg-yellow-500/20" : "text-zinc-400 hover:bg-white/10"}`}
                onClick={() => void handleFavorite(item)}
              >
                <Star className={`h-4 w-4 ${item.isFavorite ? "fill-yellow-300" : ""}`} />
              </Button>
              {item.url ? (
                <Button asChild variant="secondary" className="h-9 bg-white/10 hover:bg-white/20">
                  <a href={item.url} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Open
                  </a>
                </Button>
              ) : (
                <Button variant="secondary" className="h-9 bg-white/10 hover:bg-white/20" disabled>
                  <FileText className="h-4 w-4" />
                  Unavailable
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-9 w-9 text-red-300 hover:bg-red-500/20" onClick={() => void handleDelete(item)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export type { ResourceView }
