"use server"

import { revalidatePath } from "next/cache"

import type { ActionResult } from "@/lib/action-types"
import type { Note } from "@/lib/notes/types"
import { getCurrentUser } from "@/lib/subjects/queries"
import { createClient } from "@/lib/supabase/server"

function normalizeText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim()
}

function parseTags(input: string) {
  return input
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
}

export async function createNote(formData: FormData): Promise<ActionResult<Note>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "Unauthorized." }

  const subjectId = normalizeText(formData.get("subjectId"))
  const title = normalizeText(formData.get("title"))
  const content = String(formData.get("content") ?? "")
  const tags = parseTags(normalizeText(formData.get("tags")))
  const unitLabel = normalizeText(formData.get("unitLabel"))
  const topicLabel = normalizeText(formData.get("topicLabel"))
  const isPinned = normalizeText(formData.get("isPinned")) === "true"

  if (!subjectId) return { success: false, error: "Select a subject." }
  if (title.length < 2) return { success: false, error: "Title must be at least 2 characters." }

  const metaTags = [...tags]
  if (unitLabel) metaTags.push(`unit:${unitLabel}`)
  if (topicLabel) metaTags.push(`topic:${topicLabel}`)

  const supabase = await createClient()
  const db = supabase as any
  const { data, error } = await db
    .from("notes")
    .insert({
      user_id: user.id,
      subject_id: subjectId,
      title,
      content,
      tags: Array.from(new Set(metaTags)),
      is_pinned: isPinned
    })
    .select("*")
    .single()

  if (error || !data) return { success: false, error: error?.message ?? "Failed to create note." }

  revalidatePath("/notes")
  revalidatePath("/dashboard")
  revalidatePath(`/subjects/${subjectId}`)
  return { success: true, data: data as Note, message: "Note created." }
}

export async function updateNote(formData: FormData): Promise<ActionResult<Note>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "Unauthorized." }

  const id = normalizeText(formData.get("id"))
  const subjectId = normalizeText(formData.get("subjectId"))
  const title = normalizeText(formData.get("title"))
  const content = String(formData.get("content") ?? "")
  const tags = parseTags(normalizeText(formData.get("tags")))
  const isPinned = normalizeText(formData.get("isPinned")) === "true"

  if (!id) return { success: false, error: "Missing note id." }
  if (!subjectId) return { success: false, error: "Select a subject." }
  if (title.length < 2) return { success: false, error: "Title must be at least 2 characters." }

  const supabase = await createClient()
  const db = supabase as any
  const { data, error } = await db
    .from("notes")
    .update({
      subject_id: subjectId,
      title,
      content,
      tags,
      is_pinned: isPinned
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single()

  if (error || !data) return { success: false, error: error?.message ?? "Failed to update note." }

  revalidatePath("/notes")
  revalidatePath(`/notes/${id}`)
  revalidatePath("/dashboard")
  revalidatePath(`/subjects/${subjectId}`)
  return { success: true, data: data as Note, message: "Note updated." }
}

export async function saveNoteDraft(input: {
  id: string
  subjectId: string
  title: string
  content: string
  tags: string[]
  isPinned: boolean
}): Promise<ActionResult<Note>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "Unauthorized." }

  if (!input.id || input.title.trim().length < 2) {
    return { success: false, error: "Title must be at least 2 characters." }
  }

  const supabase = await createClient()
  const db = supabase as any
  const { data, error } = await db
    .from("notes")
    .update({
      subject_id: input.subjectId,
      title: input.title.trim(),
      content: input.content,
      tags: input.tags,
      is_pinned: input.isPinned
    })
    .eq("id", input.id)
    .eq("user_id", user.id)
    .select("*")
    .single()

  if (error || !data) return { success: false, error: error?.message ?? "Autosave failed." }

  revalidatePath(`/notes/${input.id}`)
  revalidatePath("/notes")
  revalidatePath("/dashboard")
  revalidatePath(`/subjects/${input.subjectId}`)
  return { success: true, data: data as Note }
}

export async function deleteNote(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "Unauthorized." }

  const id = normalizeText(formData.get("id"))
  const subjectId = normalizeText(formData.get("subjectId"))
  if (!id) return { success: false, error: "Missing note id." }

  const supabase = await createClient()
  const db = supabase as any
  const { error } = await db.from("notes").delete().eq("id", id).eq("user_id", user.id)
  if (error) return { success: false, error: error.message }

  revalidatePath("/notes")
  revalidatePath("/dashboard")
  if (subjectId) revalidatePath(`/subjects/${subjectId}`)
  return { success: true, data: { id }, message: "Note deleted." }
}

export async function toggleNotePin(formData: FormData): Promise<ActionResult<Note>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "Unauthorized." }
  const id = normalizeText(formData.get("id"))
  const next = normalizeText(formData.get("next")) === "true"

  const supabase = await createClient()
  const db = supabase as any
  const { data, error } = await db.from("notes").update({ is_pinned: next }).eq("id", id).eq("user_id", user.id).select("*").single()
  if (error || !data) return { success: false, error: error?.message ?? "Failed to toggle pin." }
  revalidatePath("/notes")
  revalidatePath("/dashboard")
  return { success: true, data: data as Note }
}

