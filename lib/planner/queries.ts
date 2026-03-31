import { cache } from "react"

import type { Task } from "@/lib/planner/types"
import { getCurrentUser, isRecoverableDbError, logRecoverableDbWarning } from "@/lib/subjects/queries"
import { createClient } from "@/lib/supabase/server"

export const getTasks = cache(async () => {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("tasks")
    .select("*, subjects(name)")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true })
    .order("due_date", { ascending: true })

  if (error) {
    if (isRecoverableDbError(error)) {
      logRecoverableDbWarning("getTasks", error)
      return []
    }
    throw new Error(error.message)
  }
  return (data ?? []) as Array<Task & { subjects?: { name: string } | null }>
})

export const getDueTodayTasks = cache(async () => {
  const user = await getCurrentUser()
  if (!user) return []

  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .gte("due_date", start)
    .lt("due_date", end)
    .neq("status", "completed")
    .order("due_date", { ascending: true })

  if (error) {
    if (isRecoverableDbError(error)) {
      logRecoverableDbWarning("getDueTodayTasks", error)
      return []
    }
    throw new Error(error.message)
  }
  return (data ?? []) as Task[]
})

export const getUpcomingDeadlines = cache(async (limit = 6) => {
  const user = await getCurrentUser()
  if (!user) return []
  const nowIso = new Date().toISOString()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .gte("due_date", nowIso)
    .neq("status", "completed")
    .order("due_date", { ascending: true })
    .limit(limit)
  if (error) {
    if (isRecoverableDbError(error)) {
      logRecoverableDbWarning("getUpcomingDeadlines", error)
      return []
    }
    throw new Error(error.message)
  }
  return (data ?? []) as Task[]
})
