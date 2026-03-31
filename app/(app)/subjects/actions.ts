"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import type { ActionResult } from "@/lib/action-types"
import { FILE_BUCKET_BY_TYPE } from "@/lib/subjects/constants"
import type { Resource, ResourcePriority, ResourceType, Subject } from "@/lib/subjects/types"
import { FILE_RESOURCE_TYPES } from "@/lib/subjects/types"
import { createClient } from "@/lib/supabase/server"

function normalizeText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim()
}

function normalizeProgress(value: FormDataEntryValue | null) {
  const parsed = Number(value ?? "0")
  if (Number.isNaN(parsed)) return 0
  return Math.max(0, Math.min(100, Math.round(parsed)))
}

async function getActionUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error
  } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

function mapSubjectMutationError(error: { code?: string; message?: string } | null | undefined) {
  if (!error) return "Failed to create subject."
  if (error.code === "42P01" || error.code === "PGRST205") {
    return "Subjects table is missing. Run Supabase migrations first."
  }
  if (error.code === "PGRST116") {
    return "Subject insert succeeded but row could not be returned. Check subjects SELECT policy (RLS) for this user."
  }
  if (error.code === "42501") {
    return "RLS blocked this action. Check your subject policies in Supabase."
  }
  return error.message ?? "Failed to create subject."
}

async function ensureOwner(subjectId: string) {
  const user = await getActionUser()
  if (!user) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from("subjects")
    .select("id")
    .eq("id", subjectId)
    .eq("user_id", user.id)
    .maybeSingle()

  return data ? user : null
}

const checklistSchema = z.object({
  subjectId: z.string().uuid(),
  title: z.string().min(2),
  checklistType: z.enum(["topic", "revision", "syllabus"]),
  unitLabel: z.string().optional()
})

export async function createSubject(formData: FormData): Promise<ActionResult<Subject>> {
  const user = await getActionUser()
  if (!user) return { success: false, error: "Your session expired. Please log in again." }

  const name = normalizeText(formData.get("name"))
  const semester = normalizeText(formData.get("semester"))
  const color = normalizeText(formData.get("color"))
  const progress = normalizeProgress(formData.get("progress"))

  if (name.length < 2) return { success: false, error: "Subject name must be at least 2 characters." }
  if (semester.length < 2) return { success: false, error: "Semester is required." }
  if (!/^#([A-Fa-f0-9]{6})$/.test(color)) return { success: false, error: "Color must be a valid hex value." }

  try {
    const supabase = await createClient()
    const db = supabase as any
    const { data, error } = await db
      .from("subjects")
      .insert({
        user_id: user.id,
        name,
        semester,
        color,
        progress
      })
      .select("*")
      .single()

    if (error || !data) return { success: false, error: mapSubjectMutationError(error) }

    revalidatePath("/subjects")
    return { success: true, data: data as Subject, message: "Subject created." }
  } catch (error) {
    return {
      success: false,
      error: `Subject creation failed: ${(error as Error).message}`
    }
  }
}

export async function updateSubject(formData: FormData): Promise<ActionResult<Subject>> {
  const user = await getActionUser()
  if (!user) return { success: false, error: "Unauthorized." }

  const id = normalizeText(formData.get("id"))
  const name = normalizeText(formData.get("name"))
  const semester = normalizeText(formData.get("semester"))
  const color = normalizeText(formData.get("color"))
  const progress = normalizeProgress(formData.get("progress"))

  if (!id) return { success: false, error: "Subject id is required." }
  if (name.length < 2) return { success: false, error: "Subject name must be at least 2 characters." }
  if (semester.length < 2) return { success: false, error: "Semester is required." }
  if (!/^#([A-Fa-f0-9]{6})$/.test(color)) return { success: false, error: "Color must be a valid hex value." }

  const supabase = await createClient()
  const db = supabase as any
  const { data, error } = await db
    .from("subjects")
    .update({ name, semester, color, progress })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single()

  if (error || !data) return { success: false, error: error?.message ?? "Failed to update subject." }

  revalidatePath("/subjects")
  revalidatePath(`/subjects/${id}`)
  return { success: true, data: data as Subject, message: "Subject updated." }
}

export async function deleteSubject(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const user = await getActionUser()
  if (!user) return { success: false, error: "Unauthorized." }

  const id = normalizeText(formData.get("id"))
  if (!id) return { success: false, error: "Subject id is required." }

  const supabase = await createClient()
  const db = supabase as any
  const { error } = await db.from("subjects").delete().eq("id", id).eq("user_id", user.id)
  if (error) return { success: false, error: error.message }

  revalidatePath("/subjects")
  return { success: true, data: { id }, message: "Subject deleted." }
}

export async function toggleSubjectPin(formData: FormData): Promise<ActionResult<{ id: string; isPinned: boolean }>> {
  const user = await getActionUser()
  if (!user) return { success: false, error: "Unauthorized." }
  const id = normalizeText(formData.get("id"))
  const isPinned = normalizeText(formData.get("isPinned")) === "true"
  if (!id) return { success: false, error: "Missing subject id." }

  const supabase = await createClient()
  const db = supabase as any
  const { error } = await db.from("subjects").update({ is_pinned: isPinned }).eq("id", id).eq("user_id", user.id)
  if (error) return { success: false, error: error.message }

  revalidatePath("/dashboard")
  revalidatePath("/subjects")
  return { success: true, data: { id, isPinned } }
}

function asResourceType(value: string): ResourceType | null {
  const typed = value as ResourceType
  const accepted: ResourceType[] = ["course_link", "youtube_playlist", "github_repo", "drive_link", "syllabus_pdf", "pyq_pdf", "ebook_pdf"]
  return accepted.includes(typed) ? typed : null
}

function asPriority(value: string): ResourcePriority {
  const typed = value as ResourcePriority
  return typed === "low" || typed === "high" || typed === "medium" ? typed : "medium"
}

export async function createResource(formData: FormData): Promise<ActionResult<Resource>> {
  const subjectId = normalizeText(formData.get("subjectId"))
  const title = normalizeText(formData.get("title"))
  const unitLabel = normalizeText(formData.get("unitLabel")) || null
  const topicLabel = normalizeText(formData.get("topicLabel")) || null
  const typeValue = normalizeText(formData.get("resourceType"))
  const priorityValue = normalizeText(formData.get("priority"))

  const resourceType = asResourceType(typeValue)
  if (!resourceType) return { success: false, error: "Invalid resource type." }
  if (title.length < 2) return { success: false, error: "Resource title must be at least 2 characters." }

  const owner = await ensureOwner(subjectId)
  if (!owner) return { success: false, error: "Subject not found." }

  const priority = asPriority(priorityValue)
  const isFileResource = FILE_RESOURCE_TYPES.includes(resourceType)

  const supabase = await createClient()
  let url: string | null = null
  let storageBucket: string | null = null
  let storagePath: string | null = null

  if (isFileResource) {
    const fileEntry = formData.get("file")
    if (!(fileEntry instanceof File) || fileEntry.size === 0) {
      return { success: false, error: "PDF file is required for this resource type." }
    }

    if (!fileEntry.type.includes("pdf")) {
      return { success: false, error: "Only PDF files are supported." }
    }

    const bucket = FILE_BUCKET_BY_TYPE[resourceType]
    if (!bucket) return { success: false, error: "Storage bucket mapping missing." }

    const sanitizedName = fileEntry.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const path = `${owner.id}/${subjectId}/${crypto.randomUUID()}-${sanitizedName}`

    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, fileEntry, {
      contentType: fileEntry.type,
      upsert: false
    })

    if (uploadError) {
      return { success: false, error: uploadError.message }
    }

    storageBucket = bucket
    storagePath = path
  } else {
    const inputUrl = normalizeText(formData.get("url"))
    if (!inputUrl) return { success: false, error: "URL is required for link resources." }
    try {
      url = new URL(inputUrl).toString()
    } catch {
      return { success: false, error: "Please provide a valid URL." }
    }
  }

  const db = supabase as any
  const { data, error } = await db
    .from("subject_resources")
    .insert({
      user_id: owner.id,
      subject_id: subjectId,
      title,
      resource_type: resourceType,
      priority,
      unit_label: unitLabel,
      topic_label: topicLabel,
      url,
      storage_bucket: storageBucket,
      storage_path: storagePath
    })
    .select("*")
    .single()

  if (error || !data) return { success: false, error: error?.message ?? "Failed to add resource." }

  revalidatePath(`/subjects/${subjectId}`)
  revalidatePath(`/subjects/${subjectId}/resources`)
  revalidatePath(`/subjects/${subjectId}/syllabus`)
  return { success: true, data: data as Resource, message: "Resource added." }
}

export async function deleteResource(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const user = await getActionUser()
  if (!user) return { success: false, error: "Unauthorized." }

  const id = normalizeText(formData.get("id"))
  const subjectId = normalizeText(formData.get("subjectId"))

  if (!id || !subjectId) {
    return { success: false, error: "Resource id and subject id are required." }
  }

  const supabase = await createClient()
  const db = supabase as any
  const { data: resource, error: fetchError } = await db
    .from("subject_resources")
    .select("id,user_id,subject_id,storage_bucket,storage_path")
    .eq("id", id)
    .eq("subject_id", subjectId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (fetchError || !resource) {
    return { success: false, error: fetchError?.message ?? "Resource not found." }
  }

  if (resource.storage_bucket && resource.storage_path) {
    await supabase.storage.from(resource.storage_bucket).remove([resource.storage_path])
  }

  const { error } = await db.from("subject_resources").delete().eq("id", id).eq("user_id", user.id)
  if (error) return { success: false, error: error.message }

  revalidatePath(`/subjects/${subjectId}`)
  revalidatePath(`/subjects/${subjectId}/resources`)
  revalidatePath(`/subjects/${subjectId}/syllabus`)
  return { success: true, data: { id }, message: "Resource deleted." }
}

export async function toggleResourceFavorite(formData: FormData): Promise<ActionResult<{ id: string; isFavorite: boolean }>> {
  const user = await getActionUser()
  if (!user) return { success: false, error: "Unauthorized." }

  const id = normalizeText(formData.get("id"))
  const subjectId = normalizeText(formData.get("subjectId"))
  const isFavorite = normalizeText(formData.get("isFavorite")) === "true"
  if (!id || !subjectId) return { success: false, error: "Missing resource details." }

  const supabase = await createClient()
  const db = supabase as any
  const { error } = await db
    .from("subject_resources")
    .update({ is_favorite: isFavorite })
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("subject_id", subjectId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/subjects/${subjectId}`)
  revalidatePath(`/subjects/${subjectId}/resources`)
  revalidatePath("/dashboard")
  return { success: true, data: { id, isFavorite } }
}

export async function createChecklistItem(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const user = await getActionUser()
  if (!user) return { success: false, error: "Unauthorized." }

  const parsed = checklistSchema.safeParse({
    subjectId: normalizeText(formData.get("subjectId")),
    title: normalizeText(formData.get("title")),
    checklistType: normalizeText(formData.get("checklistType")),
    unitLabel: normalizeText(formData.get("unitLabel")) || undefined
  })
  if (!parsed.success) return { success: false, error: "Invalid checklist values." }

  const supabase = await createClient()
  const db = supabase as any
  const { data, error } = await db
    .from("subject_checklists")
    .insert({
      user_id: user.id,
      subject_id: parsed.data.subjectId,
      checklist_type: parsed.data.checklistType,
      title: parsed.data.title,
      unit_label: parsed.data.unitLabel ?? null
    })
    .select("id")
    .single()
  if (error || !data) return { success: false, error: error?.message ?? "Failed to create checklist item." }

  revalidatePath(`/subjects/${parsed.data.subjectId}`)
  return { success: true, data: { id: data.id } }
}

export async function toggleChecklistItem(formData: FormData): Promise<ActionResult<{ id: string; isCompleted: boolean }>> {
  const user = await getActionUser()
  if (!user) return { success: false, error: "Unauthorized." }
  const id = normalizeText(formData.get("id"))
  const subjectId = normalizeText(formData.get("subjectId"))
  const isCompleted = normalizeText(formData.get("isCompleted")) === "true"
  if (!id || !subjectId) return { success: false, error: "Missing checklist item." }

  const supabase = await createClient()
  const db = supabase as any
  const { error } = await db
    .from("subject_checklists")
    .update({ is_completed: isCompleted })
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("subject_id", subjectId)
  if (error) return { success: false, error: error.message }
  revalidatePath(`/subjects/${subjectId}`)
  return { success: true, data: { id, isCompleted } }
}

export async function deleteChecklistItem(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const user = await getActionUser()
  if (!user) return { success: false, error: "Unauthorized." }
  const id = normalizeText(formData.get("id"))
  const subjectId = normalizeText(formData.get("subjectId"))
  if (!id || !subjectId) return { success: false, error: "Missing checklist item." }

  const supabase = await createClient()
  const db = supabase as any
  const { error } = await db.from("subject_checklists").delete().eq("id", id).eq("user_id", user.id).eq("subject_id", subjectId)
  if (error) return { success: false, error: error.message }
  revalidatePath(`/subjects/${subjectId}`)
  return { success: true, data: { id } }
}
