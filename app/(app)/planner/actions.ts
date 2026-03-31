"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import type { ActionResult } from "@/lib/action-types"
import type { Task, TaskPriority, TaskStatus } from "@/lib/planner/types"
import { getCurrentUser } from "@/lib/subjects/queries"
import { createClient } from "@/lib/supabase/server"

function normalizeText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim()
}

function asPriority(value: string): TaskPriority {
  return value === "low" || value === "high" || value === "medium" ? value : "medium"
}

function asStatus(value: string): TaskStatus {
  return value === "todo" || value === "in_progress" || value === "completed" ? value : "todo"
}

function revisionRound(value: string) {
  const parsed = Number(value)
  if (Number.isNaN(parsed)) return 1
  return Math.max(1, Math.round(parsed))
}

function parseDateTimeInput(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString()
}

export async function createTask(formData: FormData): Promise<ActionResult<Task>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "Unauthorized." }

  const subjectId = normalizeText(formData.get("subjectId"))
  const title = normalizeText(formData.get("title"))
  const dueDate = normalizeText(formData.get("dueDate"))
  const priority = asPriority(normalizeText(formData.get("priority")))
  const status = asStatus(normalizeText(formData.get("status")) || "todo")
  const round = revisionRound(normalizeText(formData.get("revisionRound")) || "1")

  if (!subjectId) return { success: false, error: "Select a subject." }
  if (title.length < 2) return { success: false, error: "Task title must be at least 2 characters." }
  if (!dueDate) return { success: false, error: "Due date is required." }

  const isoDueDate = parseDateTimeInput(dueDate)
  if (!isoDueDate) return { success: false, error: "Due date is invalid." }
  const supabase = await createClient()
  const db = supabase as any
  const { data, error } = await db
    .from("tasks")
    .insert({
      user_id: user.id,
      subject_id: subjectId,
      title,
      due_date: isoDueDate,
      priority,
      status,
      revision_round: round
    })
    .select("*")
    .single()
  if (error || !data) return { success: false, error: error?.message ?? "Failed to create task." }

  revalidatePath("/planner")
  revalidatePath("/dashboard")
  revalidatePath(`/subjects/${subjectId}`)
  return { success: true, data: data as Task, message: "Task created." }
}

export async function updateTask(formData: FormData): Promise<ActionResult<Task>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "Unauthorized." }

  const id = normalizeText(formData.get("id"))
  const subjectId = normalizeText(formData.get("subjectId"))
  const title = normalizeText(formData.get("title"))
  const dueDate = normalizeText(formData.get("dueDate"))
  const priority = asPriority(normalizeText(formData.get("priority")))
  const status = asStatus(normalizeText(formData.get("status")))
  const round = revisionRound(normalizeText(formData.get("revisionRound")) || "1")

  if (!id) return { success: false, error: "Missing task id." }
  if (!subjectId) return { success: false, error: "Select a subject." }
  if (title.length < 2) return { success: false, error: "Task title must be at least 2 characters." }
  if (!dueDate) return { success: false, error: "Due date is required." }

  const isoDueDate = parseDateTimeInput(dueDate)
  if (!isoDueDate) return { success: false, error: "Due date is invalid." }
  const supabase = await createClient()
  const db = supabase as any
  const { data, error } = await db
    .from("tasks")
    .update({
      subject_id: subjectId,
      title,
      due_date: isoDueDate,
      priority,
      status,
      revision_round: round
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single()
  if (error || !data) return { success: false, error: error?.message ?? "Failed to update task." }

  revalidatePath("/planner")
  revalidatePath("/dashboard")
  revalidatePath(`/subjects/${subjectId}`)
  return { success: true, data: data as Task, message: "Task updated." }
}

export async function deleteTask(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "Unauthorized." }
  const id = normalizeText(formData.get("id"))
  if (!id) return { success: false, error: "Missing task id." }

  const supabase = await createClient()
  const db = supabase as any
  const { error } = await db.from("tasks").delete().eq("id", id).eq("user_id", user.id)
  if (error) return { success: false, error: error.message }

  revalidatePath("/planner")
  revalidatePath("/dashboard")
  return { success: true, data: { id }, message: "Task deleted." }
}

export async function setTaskStatus(formData: FormData): Promise<ActionResult<Task>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "Unauthorized." }

  const id = normalizeText(formData.get("id"))
  const status = asStatus(normalizeText(formData.get("status")))
  const supabase = await createClient()
  const db = supabase as any
  const { data, error } = await db
    .from("tasks")
    .update({ status })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single()
  if (error || !data) return { success: false, error: error?.message ?? "Failed to update status." }
  revalidatePath("/planner")
  revalidatePath("/dashboard")
  return { success: true, data: data as Task }
}

const reorderSchema = z.object({
  ids: z.array(z.string().uuid()).min(1)
})

export async function reorderTasksByPriority(input: { ids: string[] }): Promise<ActionResult<{ count: number }>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "Unauthorized." }

  const parsed = reorderSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: "Invalid reorder payload." }

  const supabase = await createClient()
  const db = supabase as any

  for (let index = 0; index < parsed.data.ids.length; index += 1) {
    const id = parsed.data.ids[index]
    const priority: TaskPriority = index < 2 ? "high" : index < 5 ? "medium" : "low"
    await db.from("tasks").update({ sort_order: index, priority }).eq("id", id).eq("user_id", user.id)
  }

  revalidatePath("/planner")
  revalidatePath("/dashboard")
  return { success: true, data: { count: parsed.data.ids.length } }
}
