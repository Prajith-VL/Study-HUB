import { cache } from "react"

import type { Video } from "@/lib/videos/types"
import { getCurrentUser, isRecoverableDbError, logRecoverableDbWarning } from "@/lib/subjects/queries"
import { createClient } from "@/lib/supabase/server"

export async function getVideosBySubject(subjectId: string) {
  const user = await getCurrentUser()
  if (!user) return []
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .eq("user_id", user.id)
    .eq("subject_id", subjectId)
    .order("created_at", { ascending: false })
  if (error) {
    if (isRecoverableDbError(error)) {
      logRecoverableDbWarning("getVideosBySubject", error)
      return []
    }
    throw new Error(error.message)
  }
  return (data ?? []) as Video[]
}

export const getContinueLearningVideo = cache(async () => {
  const user = await getCurrentUser()
  if (!user) return null
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("videos")
    .select("*, subjects(name)")
    .eq("user_id", user.id)
    .gt("total_videos", 0)
    .order("last_watched", { ascending: false, nullsFirst: false })
    .limit(10)
  if (error) {
    if (isRecoverableDbError(error)) {
      logRecoverableDbWarning("getContinueLearningVideo", error)
      return null
    }
    throw new Error(error.message)
  }
  const candidate = (data as Array<Video & { subjects?: { name: string } | null }>)?.find(
    (video) => video.completed_videos < video.total_videos
  )
  return candidate ?? null
})
