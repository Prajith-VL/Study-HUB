"use server"

import { revalidatePath } from "next/cache"

import type { ActionResult } from "@/lib/action-types"
import type { Video } from "@/lib/videos/types"
import { getCurrentUser } from "@/lib/subjects/queries"
import { createClient } from "@/lib/supabase/server"

function normalizeText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim()
}

function nonNegativeInt(value: string, fallback = 0) {
  const parsed = Number(value)
  if (Number.isNaN(parsed)) return fallback
  return Math.max(0, Math.round(parsed))
}

function parseDateTimeInput(value: string | null) {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "__invalid__"
  return parsed.toISOString()
}

export async function createVideoTrack(formData: FormData): Promise<ActionResult<Video>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "Unauthorized." }

  const subjectId = normalizeText(formData.get("subjectId"))
  const title = normalizeText(formData.get("title"))
  const url = normalizeText(formData.get("url"))
  const totalVideos = nonNegativeInt(normalizeText(formData.get("totalVideos")), 0)
  const completedVideos = nonNegativeInt(normalizeText(formData.get("completedVideos")), 0)
  const lastWatched = normalizeText(formData.get("lastWatched")) || null
  const noteId = normalizeText(formData.get("noteId")) || null

  if (!subjectId) return { success: false, error: "Subject is required." }
  if (title.length < 2) return { success: false, error: "Title must be at least 2 characters." }

  try {
    new URL(url)
  } catch {
    return { success: false, error: "Please enter a valid video or playlist URL." }
  }

  if (completedVideos > totalVideos) {
    return { success: false, error: "Completed videos cannot exceed total videos." }
  }

  const lastWatchedIso = parseDateTimeInput(lastWatched)
  if (lastWatchedIso === "__invalid__") {
    return { success: false, error: "Last watched date is invalid." }
  }

  const supabase = await createClient()
  const db = supabase as any
  const { data, error } = await db
    .from("videos")
    .insert({
      user_id: user.id,
      subject_id: subjectId,
      title,
      url,
      total_videos: totalVideos,
      completed_videos: completedVideos,
      last_watched: lastWatchedIso,
      note_id: noteId
    })
    .select("*")
    .single()

  if (error || !data) return { success: false, error: error?.message ?? "Failed to create tracker." }

  revalidatePath("/dashboard")
  revalidatePath(`/subjects/${subjectId}`)
  return { success: true, data: data as Video, message: "Video tracker added." }
}

export async function updateVideoTrack(formData: FormData): Promise<ActionResult<Video>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "Unauthorized." }

  const id = normalizeText(formData.get("id"))
  const subjectId = normalizeText(formData.get("subjectId"))
  const title = normalizeText(formData.get("title"))
  const url = normalizeText(formData.get("url"))
  const totalVideos = nonNegativeInt(normalizeText(formData.get("totalVideos")), 0)
  const completedVideos = nonNegativeInt(normalizeText(formData.get("completedVideos")), 0)
  const lastWatched = normalizeText(formData.get("lastWatched")) || null
  const noteId = normalizeText(formData.get("noteId")) || null

  if (!id || !subjectId) return { success: false, error: "Missing tracker id or subject id." }
  if (title.length < 2) return { success: false, error: "Title must be at least 2 characters." }
  try {
    new URL(url)
  } catch {
    return { success: false, error: "Please enter a valid video or playlist URL." }
  }
  if (completedVideos > totalVideos) return { success: false, error: "Completed videos cannot exceed total videos." }

  const lastWatchedIso = parseDateTimeInput(lastWatched)
  if (lastWatchedIso === "__invalid__") {
    return { success: false, error: "Last watched date is invalid." }
  }

  const supabase = await createClient()
  const db = supabase as any
  const { data, error } = await db
    .from("videos")
    .update({
      title,
      url,
      total_videos: totalVideos,
      completed_videos: completedVideos,
      last_watched: lastWatchedIso,
      note_id: noteId
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single()

  if (error || !data) return { success: false, error: error?.message ?? "Failed to update tracker." }
  revalidatePath("/dashboard")
  revalidatePath(`/subjects/${subjectId}`)
  return { success: true, data: data as Video, message: "Video tracker updated." }
}

export async function deleteVideoTrack(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "Unauthorized." }
  const id = normalizeText(formData.get("id"))
  const subjectId = normalizeText(formData.get("subjectId"))
  if (!id) return { success: false, error: "Missing tracker id." }

  const supabase = await createClient()
  const db = supabase as any
  const { error } = await db.from("videos").delete().eq("id", id).eq("user_id", user.id)
  if (error) return { success: false, error: error.message }

  revalidatePath("/dashboard")
  if (subjectId) revalidatePath(`/subjects/${subjectId}`)
  return { success: true, data: { id }, message: "Video tracker removed." }
}
