"use client"

import { useState, useTransition } from "react"

import { Loader2, Plus, StickyNote } from "lucide-react"

import { createNote } from "@/app/(app)/notes/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { useToast } from "@/components/ui/toast"

type SubjectOption = {
  id: string
  name: string
}

type NoteCreateModalProps = {
  subjects: SubjectOption[]
  defaultSubjectId?: string
  triggerLabel?: string
  compact?: boolean
}

export function NoteCreateModal({ subjects, defaultSubjectId, triggerLabel = "Quick Note", compact = false }: NoteCreateModalProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  if (!subjects.length) {
    return (
      <Button disabled variant="secondary" className="bg-white/10">
        <StickyNote className="h-4 w-4" />
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
        {compact ? <Plus className="h-4 w-4" /> : <StickyNote className="h-4 w-4" />}
        {triggerLabel}
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create Note"
        description="Capture a thought before it disappears."
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            const formData = new FormData(event.currentTarget)
            startTransition(async () => {
              const result = await createNote(formData)
              if (!result.success) {
                toast({ title: "Could not create note", description: result.error, variant: "error" })
                return
              }
              toast({ title: "Note created", variant: "success" })
              setOpen(false)
            })
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="subjectId">Subject</Label>
            <select
              id="subjectId"
              name="subjectId"
              defaultValue={defaultSubjectId ?? subjects[0]?.id}
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
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="Revision plan for Unit 3" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Markdown Content</Label>
            <textarea
              id="content"
              name="content"
              rows={8}
              className="w-full rounded-md border border-border/60 bg-black/60 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
              placeholder="# Heading&#10;- key points&#10;- formulas"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="unitLabel">Unit</Label>
              <Input id="unitLabel" name="unitLabel" placeholder="Unit 2" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topicLabel">Topic</Label>
              <Input id="topicLabel" name="topicLabel" placeholder="Process Scheduling" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input id="tags" name="tags" placeholder="exam, revision, important" />
          </div>
          <Button type="submit" disabled={isPending} className="h-11 w-full rounded-full bg-[#b784ff] text-black hover:bg-[#c697ff]">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Create Note
          </Button>
        </form>
      </Modal>
    </>
  )
}

