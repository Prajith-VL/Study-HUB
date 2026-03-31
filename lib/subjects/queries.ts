import { cache } from "react"

import { createClient } from "@/lib/supabase/server"
import type { Resource, ResourceType, Subject } from "@/lib/subjects/types"

type DbErrorLike = {
  code?: string
  message?: string
  details?: string
}

export function isRecoverableDbError(error: DbErrorLike | null | undefined): boolean {
  const code = error?.code
  return (
    code === "42P01" || // undefined table
    code === "42501" || // permission denied
    code === "PGRST200" || // relation parsing issue
    code === "PGRST204" || // unknown column
    code === "PGRST205" // table not found in schema cache
  )
}

export function logRecoverableDbWarning(scope: string, error: DbErrorLike) {
  if (process.env.NODE_ENV !== "development") return
  console.warn(`[${scope}] recoverable-db-warning`, {
    code: error.code,
    message: error.message,
    details: error.details
  })
}

export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }
  return user
})

export const getSubjects = cache(async () => {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    if (isRecoverableDbError(error)) {
      logRecoverableDbWarning("getSubjects", error)
      return []
    }
    throw new Error(error.message)
  }

  return (data ?? []) as Subject[]
})

export const getSubjectById = cache(async (subjectId: string) => {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("id", subjectId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (error) {
    if (isRecoverableDbError(error)) {
      logRecoverableDbWarning("getSubjectById", error)
      return null
    }
    throw new Error(error.message)
  }

  return data as Subject | null
})

export async function getSubjectResources(subjectId: string, type?: ResourceType) {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await createClient()
  let query = supabase
    .from("subject_resources")
    .select("*")
    .eq("subject_id", subjectId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (type) {
    query = query.eq("resource_type", type)
  }

  const { data, error } = await query
  if (error) {
    if (isRecoverableDbError(error)) {
      logRecoverableDbWarning("getSubjectResources", error)
      return []
    }
    throw new Error(error.message)
  }

  return (data ?? []) as Resource[]
}

export async function getSubjectChecklists(subjectId: string) {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await createClient()
  const db = supabase as any
  const { data, error } = await db
    .from("subject_checklists")
    .select("*")
    .eq("subject_id", subjectId)
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })

  if (error) {
    if (isRecoverableDbError(error)) {
      logRecoverableDbWarning("getSubjectChecklists", error)
      return []
    }
    throw new Error(error.message)
  }

  return data as Array<{
    id: string
    checklist_type: "topic" | "revision" | "syllabus"
    title: string
    unit_label: string | null
    is_completed: boolean
  }>
}

export async function getSignedResourceUrl(resource: Resource) {
  if (!resource.storage_bucket || !resource.storage_path) {
    return resource.url
  }

  const supabase = await createClient()
  const { data, error } = await supabase.storage
    .from(resource.storage_bucket)
    .createSignedUrl(resource.storage_path, 60 * 10)

  if (error || !data?.signedUrl) {
    return null
  }
  return data.signedUrl
}
