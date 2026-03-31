"use client"

import Link from "next/link"
import type { Route } from "next"
import { useEffect, useMemo, useOptimistic, useRef, useState } from "react"

import { Pin, PinOff, Search, Trash2 } from "lucide-react"

import { deleteNote, toggleNotePin } from "@/app/(app)/notes/actions"
import { NoteCreateModal } from "@/components/notes/note-create-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import type { Note } from "@/lib/notes/types"

type SubjectOption = { id: string; name: string }
type NoteWithSubject = Note & { subjects?: { name: string } | null }

type OptimisticAction =
  | { type: "delete"; id: string }
  | { type: "restore"; note: NoteWithSubject }
  | { type: "pin"; id: string; isPinned: boolean }

function reduceNotes(state: NoteWithSubject[], action: OptimisticAction) {
  if (action.type === "delete") return state.filter((note) => note.id !== action.id)
  if (action.type === "restore") return [action.note, ...state]
  return state.map((note) => (note.id === action.id ? { ...note, is_pinned: action.isPinned } : note))
}

type NotesBoardProps = {
  initialNotes: NoteWithSubject[]
  subjects: SubjectOption[]
}

export function NotesBoard({ initialNotes, subjects }: NotesBoardProps) {
  const [search, setSearch] = useState("")
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [notes, applyOptimistic] = useOptimistic(initialNotes, reduceNotes)
  const searchRef = useRef<HTMLInputElement | null>(null)
  const { toast } = useToast()

  const tags = useMemo(() => {
    const all = new Set<string>()
    notes.forEach((note) => note.tags.forEach((tag) => all.add(tag)))
    return Array.from(all).slice(0, 18)
  }, [notes])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return notes.filter((note) => {
      const matchesQuery =
        !query ||
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some((tag) => tag.toLowerCase().includes(query))
      const matchesTag = !activeTag || note.tags.includes(activeTag)
      return matchesQuery && matchesTag
    })
  }, [activeTag, notes, search])

  async function handleDelete(note: NoteWithSubject) {
    const fd = new FormData()
    fd.set("id", note.id)
    fd.set("subjectId", note.subject_id)
    applyOptimistic({ type: "delete", id: note.id })
    const result = await deleteNote(fd)
    if (!result.success) {
      applyOptimistic({ type: "restore", note })
      toast({ title: "Could not delete note", description: result.error, variant: "error" })
      return
    }
    toast({ title: "Note deleted", variant: "success" })
  }

  async function handleTogglePin(note: NoteWithSubject) {
    const next = !note.is_pinned
    applyOptimistic({ type: "pin", id: note.id, isPinned: next })

    const fd = new FormData()
    fd.set("id", note.id)
    fd.set("next", String(next))
    const result = await toggleNotePin(fd)
    if (!result.success) {
      applyOptimistic({ type: "pin", id: note.id, isPinned: note.is_pinned })
      toast({ title: "Pin update failed", description: result.error, variant: "error" })
      return
    }
    toast({ title: next ? "Pinned note" : "Unpinned note", variant: "success" })
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const target = event.target as HTMLElement | null
        const isTypingElement =
          target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.getAttribute("contenteditable") === "true"
        if (!isTypingElement) {
          event.preventDefault()
          searchRef.current?.focus()
        }
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <div className="space-y-6 card-reveal">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            ref={searchRef}
            placeholder="Search notes, content, tags..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
          />
        </div>
        <NoteCreateModal subjects={subjects} triggerLabel="New Note" />
      </div>

      {!!tags.length ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTag(null)}
            className={`rounded-full border px-2.5 py-1 text-xs ${!activeTag ? "border-primary/40 bg-primary/20 text-primary" : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200"}`}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag)}
              className={`rounded-full border px-2.5 py-1 text-xs ${activeTag === tag ? "border-primary/40 bg-primary/20 text-primary" : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200"}`}
            >
              #{tag}
            </button>
          ))}
        </div>
      ) : null}

      {!filtered.length ? (
        <Card className="border-white/10 bg-white/[0.03]">
          <CardContent className="flex min-h-60 flex-col items-center justify-center gap-3 text-center">
            <p className="text-xl font-semibold text-white">No notes found</p>
            <p className="text-sm text-zinc-400">Create your first note or adjust your search/tag filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((note) => (
            <Card key={note.id} className="border-white/10 bg-white/[0.03] transition-colors hover:border-white/20">
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-500">{note.subjects?.name ?? "Subject"}</p>
                    <Link href={`/notes/${note.id}` as Route} className="block truncate text-lg font-semibold text-white hover:text-primary">
                      {note.title}
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleTogglePin(note)}
                    className="rounded-md border border-white/10 p-2 text-zinc-400 transition-colors hover:border-white/20 hover:text-zinc-200"
                    aria-label={note.is_pinned ? "Unpin note" : "Pin note"}
                  >
                    {note.is_pinned ? <Pin className="h-4 w-4 text-primary" /> : <PinOff className="h-4 w-4" />}
                  </button>
                </div>

                <p className="line-clamp-3 text-sm text-zinc-400">{note.content || "No content yet."}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {note.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-zinc-300">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-xs text-zinc-500">Updated {new Date(note.updated_at).toLocaleString()}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-300 hover:bg-red-500/20" onClick={() => void handleDelete(note)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
