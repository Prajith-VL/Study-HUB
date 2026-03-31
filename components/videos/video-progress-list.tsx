"use client"

import Link from "next/link"
import type { Route } from "next"
import { useOptimistic } from "react"

import { ExternalLink, Pencil, Trash2 } from "lucide-react"

import { deleteVideoTrack } from "@/app/(app)/subjects/video-actions"
import { VideoFormModal } from "@/components/videos/video-form-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"
import type { Video } from "@/lib/videos/types"

type NoteOption = { id: string; title: string }

type Action = { type: "delete"; id: string } | { type: "restore"; item: Video }

function reduceVideos(state: Video[], action: Action) {
  if (action.type === "delete") return state.filter((video) => video.id !== action.id)
  return [action.item, ...state]
}

type VideoProgressListProps = {
  subjectId: string
  videos: Video[]
  notes: NoteOption[]
}

export function VideoProgressList({ subjectId, videos, notes }: VideoProgressListProps) {
  const [optimistic, applyOptimistic] = useOptimistic(videos, reduceVideos)
  const { toast } = useToast()

  async function handleDelete(video: Video) {
    applyOptimistic({ type: "delete", id: video.id })
    const fd = new FormData()
    fd.set("id", video.id)
    fd.set("subjectId", subjectId)
    const result = await deleteVideoTrack(fd)
    if (!result.success) {
      applyOptimistic({ type: "restore", item: video })
      toast({ title: "Could not delete tracker", description: result.error, variant: "error" })
      return
    }
    toast({ title: "Tracker deleted", variant: "success" })
  }

  if (!optimistic.length) {
    return (
      <Card className="border-white/10 bg-white/[0.03]">
        <CardContent className="flex min-h-52 items-center justify-center text-center">
          <p className="text-sm text-zinc-400">No video trackers yet. Add one to monitor course completion.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {optimistic.map((video) => {
        const percent = video.total_videos > 0 ? Math.round((video.completed_videos / video.total_videos) * 100) : 0
        return (
          <Card key={video.id} className="border-white/10 bg-white/[0.03]">
            <CardContent className="space-y-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-white">{video.title}</p>
                  <p className="text-xs text-zinc-400">
                    {video.completed_videos}/{video.total_videos} videos complete
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild variant="secondary" className="h-8 bg-white/10 hover:bg-white/20">
                    <a href={video.url} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      Open
                    </a>
                  </Button>
                  {video.note_id ? (
                    <Button asChild variant="secondary" className="h-8 bg-white/10 hover:bg-white/20">
                      <Link href={`/notes/${video.note_id}` as Route}>Note</Link>
                    </Button>
                  ) : null}
                  <VideoFormModal subjectId={subjectId} notes={notes} initialVideo={video} label="Edit" compact />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-300 hover:bg-red-500/20" onClick={() => void handleDelete(video)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Progress</span>
                  <span>{percent}%</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-800">
                  <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
                </div>
              </div>
              <p className="text-xs text-zinc-500">
                Last watched: {video.last_watched ? new Date(video.last_watched).toLocaleString() : "Not set"}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

