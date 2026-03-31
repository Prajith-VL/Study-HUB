import { cache } from "react"

import type { Note } from "@/lib/notes/types"
import { getCurrentUser, isRecoverableDbError, logRecoverableDbWarning } from "@/lib/subjects/queries"
import { createClient } from "@/lib/supabase/server"

export const getNotes = cache(async () => {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("notes")
    .select("*, subjects(name)")
    .eq("user_id", user.id)
    .order("is_pinned", { ascending: false })
    .order("updated_at", { ascending: false })

  if (error) {
    if (isRecoverableDbError(error)) {
      logRecoverableDbWarning("getNotes", error)
      return []
    }
    throw new Error(error.message)
  }
  return (data ?? []) as Array<Note & { subjects?: { name: string } | null }>
})

export const getRecentNotes = cache(async (limit = 5) => {
  const user = await getCurrentUser()
  if (!user) return []
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("notes")
    .select("id,title,updated_at,subject_id")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(limit)
  if (error) {
    if (isRecoverableDbError(error)) {
      logRecoverableDbWarning("getRecentNotes", error)
      return []
    }
    throw new Error(error.message)
  }
  return data ?? []
})

export const getNoteById = cache(async (noteId: string) => {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", noteId)
    .eq("user_id", user.id)
    .maybeSingle()
  if (error) {
    if (isRecoverableDbError(error)) {
      logRecoverableDbWarning("getNoteById", error)
      return null
    }
    throw new Error(error.message)
  }
  return data as Note | null
})

export async function getNotesBySubject(subjectId: string, limit?: number) {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await createClient()
  let query = supabase
    .from("notes")
    .select("*")
    .eq("user_id", user.id)
    .eq("subject_id", subjectId)
    .order("is_pinned", { ascending: false })
    .order("updated_at", { ascending: false })

  if (typeof limit === "number") {
    query = query.limit(limit)
  }

  const { data, error } = await query
  if (error) {
    if (isRecoverableDbError(error)) {
      logRecoverableDbWarning("getNotesBySubject", error)
      return []
    }
    throw new Error(error.message)
  }
  return (data ?? []) as Note[]
}
