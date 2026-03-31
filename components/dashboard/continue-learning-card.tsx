import Link from "next/link"
import type { Route } from "next"

import { PlayCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Video } from "@/lib/videos/types"

type ContinueLearningCardProps = {
  video: (Video & { subjects?: { name: string } | null }) | null
}

export function ContinueLearningCard({ video }: ContinueLearningCardProps) {
  if (!video) {
    return (
      <Card className="border-white/10 bg-white/[0.03]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-400">Continue Learning</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500">No active video tracker yet.</p>
        </CardContent>
      </Card>
    )
  }

  const percent = video.total_videos > 0 ? Math.round((video.completed_videos / video.total_videos) * 100) : 0

  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-zinc-400">Continue Learning</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm text-zinc-400">{video.subjects?.name ?? "Subject"}</p>
          <p className="truncate text-lg font-semibold text-white">{video.title}</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>{video.completed_videos}/{video.total_videos} videos</span>
            <span>{percent}%</span>
          </div>
          <div className="h-2 rounded-full bg-zinc-800">
            <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild className="h-9 rounded-full bg-[#b784ff] text-black hover:bg-[#c697ff] sm:flex-1">
            <a href={video.url} target="_blank" rel="noreferrer">
              <PlayCircle className="h-4 w-4" />
              Resume
            </a>
          </Button>
          {video.subject_id ? (
            <Button asChild variant="secondary" className="h-9 bg-white/10 hover:bg-white/20 sm:flex-1">
              <Link href={`/subjects/${video.subject_id}` as Route}>Open Subject</Link>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
