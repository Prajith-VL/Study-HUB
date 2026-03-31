"use client"

import { useState, useTransition } from "react"

import { Loader2, PlayCircle } from "lucide-react"

import { createVideoTrack, updateVideoTrack } from "@/app/(app)/subjects/video-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { useToast } from "@/components/ui/toast"
import type { Video } from "@/lib/videos/types"

type NoteOption = {
  id: string
  title: string
}

type VideoFormModalProps = {
  subjectId: string
  notes: NoteOption[]
  initialVideo?: Video
  label?: string
  compact?: boolean
}

export function VideoFormModal({ subjectId, notes, initialVideo, label = "Add Video Track", compact = false }: VideoFormModalProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const edit = Boolean(initialVideo)

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className={compact ? "h-9 rounded-full bg-[#b784ff] px-3 text-black hover:bg-[#c697ff]" : "h-10 rounded-full bg-[#b784ff] text-black hover:bg-[#c697ff]"}
      >
        <PlayCircle className="h-4 w-4" />
        {label}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title={edit ? "Edit Video Tracker" : "New Video Tracker"}>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            const formData = new FormData(event.currentTarget)
            formData.set("subjectId", subjectId)
            startTransition(async () => {
              const result = edit ? await updateVideoTrack(formData) : await createVideoTrack(formData)
              if (!result.success) {
                toast({ title: edit ? "Could not update tracker" : "Could not create tracker", description: result.error, variant: "error" })
                return
              }
              toast({ title: edit ? "Tracker updated" : "Tracker added", variant: "success" })
              setOpen(false)
            })
          }}
        >
          {edit ? <input type="hidden" name="id" value={initialVideo?.id} /> : null}
          <input type="hidden" name="subjectId" value={subjectId} />

          <div className="space-y-2">
            <Label htmlFor="video-title">Title</Label>
            <Input id="video-title" name="title" defaultValue={initialVideo?.title ?? ""} placeholder="Complete React Playlist" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="video-url">Playlist/Course URL</Label>
            <Input id="video-url" name="url" type="url" defaultValue={initialVideo?.url ?? ""} placeholder="https://youtube.com/..." required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="video-total">Total Videos</Label>
              <Input id="video-total" name="totalVideos" type="number" min={0} defaultValue={initialVideo?.total_videos ?? 0} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="video-completed">Completed</Label>
              <Input id="video-completed" name="completedVideos" type="number" min={0} defaultValue={initialVideo?.completed_videos ?? 0} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="video-last">Last Watched</Label>
              <Input
                id="video-last"
                name="lastWatched"
                type="datetime-local"
                defaultValue={initialVideo?.last_watched ? new Date(initialVideo.last_watched).toISOString().slice(0, 16) : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="video-note">Attach Note</Label>
              <select
                id="video-note"
                name="noteId"
                defaultValue={initialVideo?.note_id ?? ""}
                className="flex h-11 w-full rounded-md border border-border/60 bg-black/60 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
              >
                <option value="">No linked note</option>
                {notes.map((note) => (
                  <option key={note.id} value={note.id}>
                    {note.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button type="submit" disabled={isPending} className="h-11 w-full rounded-full bg-[#b784ff] text-black hover:bg-[#c697ff]">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {edit ? "Save Changes" : "Add Tracker"}
          </Button>
        </form>
      </Modal>
    </>
  )
}

