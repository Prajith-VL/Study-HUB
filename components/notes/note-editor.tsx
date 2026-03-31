"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"

import Link from "next/link"
import type { Route } from "next"
import { Expand, Loader2, Minimize, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { deleteNote, saveNoteDraft } from "@/app/(app)/notes/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast"
import type { Note } from "@/lib/notes/types"

type SubjectOption = { id: string; name: string }

type SaveState = "idle" | "saving" | "saved" | "error"

type NoteEditorProps = {
  note: Note
  subjects: SubjectOption[]
}

export function NoteEditor({ note, subjects }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [subjectId, setSubjectId] = useState(note.subject_id)
  const [tagsInput, setTagsInput] = useState(note.tags.join(", "))
  const [isPinned, setIsPinned] = useState(note.is_pinned)
  const [saveState, setSaveState] = useState<SaveState>("idle")
  const [isReadingFullscreen, setIsReadingFullscreen] = useState(false)
  const [isDeleting, startDelete] = useTransition()
  const router = useRouter()
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  const parsedTags = useMemo(
    () =>
      tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tagsInput]
  )

  async function saveNow() {
    setSaveState("saving")
    const result = await saveNoteDraft({
      id: note.id,
      subjectId,
      title,
      content,
      tags: parsedTags,
      isPinned
    })
    if (!result.success) {
      setSaveState("error")
      return
    }
    setSaveState("saved")
    setTimeout(() => setSaveState("idle"), 1200)
  }

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      void saveNow()
    }, 900)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [title, content, subjectId, tagsInput, isPinned])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault()
        void saveNow()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [title, content, subjectId, tagsInput, isPinned])

  function saveStateText() {
    if (saveState === "saving") return "Autosaving..."
    if (saveState === "saved") return "Saved"
    if (saveState === "error") return "Autosave failed"
    return "Draft mode"
  }

  return (
    <div className="space-y-5 card-reveal">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="text-sm text-zinc-400">
          {saveStateText()} <span className="ml-2 text-xs text-zinc-500">Press Ctrl/Cmd + S to save instantly</span>
        </div>
        <Button
          variant="ghost"
          className="text-red-300 hover:bg-red-500/20"
          disabled={isDeleting}
          onClick={() =>
            startDelete(async () => {
              const fd = new FormData()
              fd.set("id", note.id)
              fd.set("subjectId", note.subject_id)
              const result = await deleteNote(fd)
              if (!result.success) {
                toast({ title: "Could not delete note", description: result.error, variant: "error" })
                return
              }
              toast({ title: "Note deleted", variant: "success" })
              router.replace("/notes")
              router.refresh()
            })
          }
        >
          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          Delete
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <select
            id="subject"
            value={subjectId}
            onChange={(event) => setSubjectId(event.target.value)}
            className="flex h-11 w-full rounded-md border border-border/60 bg-black/60 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
          >
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <Input id="tags" value={tagsInput} onChange={(event) => setTagsInput(event.target.value)} placeholder="exam, module-2, important" />
      </div>

      <label className="inline-flex items-center gap-2 text-sm text-zinc-300">
        <input type="checkbox" checked={isPinned} onChange={(event) => setIsPinned(event.target.checked)} className="accent-primary" />
        Pin this note
      </label>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="markdown">Markdown Editor</Label>
          <textarea
            id="markdown"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={22}
            className="w-full rounded-lg border border-white/10 bg-[#0a0d15] p-3 font-mono text-sm text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Preview</Label>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsReadingFullscreen(true)}>
              <Expand className="h-4 w-4" />
            </Button>
          </div>
          <div className="min-h-[520px] whitespace-pre-wrap rounded-lg border border-white/10 bg-white/[0.02] p-3 text-sm text-zinc-300">
            {content || "Preview will appear here as you type markdown content."}
          </div>
        </div>
      </div>

      <div className="text-sm text-zinc-400">
        Back to{" "}
        <Link href={`/subjects/${subjectId}` as Route} className="text-primary hover:text-primary/80">
          subject workspace
        </Link>
      </div>

      {isReadingFullscreen ? (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-[#070a12] p-6">
          <div className="mx-auto max-w-4xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Reading Mode</h2>
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setIsReadingFullscreen(false)}>
                <Minimize className="h-4 w-4" />
              </Button>
            </div>
            <article className="min-h-[70vh] whitespace-pre-wrap rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-zinc-200">
              {content || "No content yet."}
            </article>
          </div>
        </div>
      ) : null}
    </div>
  )
}
