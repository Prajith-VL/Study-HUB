import { cache } from "react"

import { safeData } from "@/lib/db/safe-query"
import { getCurrentUser } from "@/lib/subjects/queries"
import { createClient } from "@/lib/supabase/server"

export type ActivityItem = {
  id: string
  type: "note" | "task" | "video" | "resource"
  title: string
  subjectId: string | null
  createdAt: string
}

export const getPinnedSubjects = cache(async () => {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await createClient()
  const db = supabase as any
  const result = await db
    .from("subjects")
    .select("id,name,semester,color,progress,is_pinned,exam_date")
    .eq("user_id", user.id)
    .eq("is_pinned", true)
    .order("created_at", { ascending: false })
    .limit(8)

  return safeData(result, [] as Array<{ id: string; name: string; semester: string; color: string; progress: number; exam_date: string | null }>)
})

export const getRecentActivity = cache(async () => {
  const user = await getCurrentUser()
  if (!user) return []
  const supabase = await createClient()
  const db = supabase as any

  const [notes, tasks, videos, resources] = await Promise.all([
    db.from("notes").select("id,title,subject_id,updated_at").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(8),
    db.from("tasks").select("id,title,subject_id,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(8),
    db.from("videos").select("id,title,subject_id,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(8),
    db
      .from("subject_resources")
      .select("id,title,subject_id,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8)
  ])

  const activity: ActivityItem[] = [
    ...safeData(notes, []).map((row: any) => ({
      id: row.id,
      type: "note" as const,
      title: row.title,
      subjectId: row.subject_id,
      createdAt: row.updated_at
    })),
    ...safeData(tasks, []).map((row: any) => ({
      id: row.id,
      type: "task" as const,
      title: row.title,
      subjectId: row.subject_id,
      createdAt: row.created_at
    })),
    ...safeData(videos, []).map((row: any) => ({
      id: row.id,
      type: "video" as const,
      title: row.title,
      subjectId: row.subject_id,
      createdAt: row.created_at
    })),
    ...safeData(resources, []).map((row: any) => ({
      id: row.id,
      type: "resource" as const,
      title: row.title,
      subjectId: row.subject_id,
      createdAt: row.created_at
    }))
  ]

  return activity.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 18)
})

