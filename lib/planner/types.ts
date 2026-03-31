import type { Database } from "@/types/database"

export type Task = Database["public"]["Tables"]["tasks"]["Row"]
export type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"]
export type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"]
export type TaskPriority = Database["public"]["Enums"]["task_priority"]
export type TaskStatus = Database["public"]["Enums"]["task_status"]

export const TASK_PRIORITIES: TaskPriority[] = ["low", "medium", "high"]
export const TASK_STATUSES: TaskStatus[] = ["todo", "in_progress", "completed"]

