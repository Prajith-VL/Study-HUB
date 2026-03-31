import type { Database } from "@/types/database"

export type Note = Database["public"]["Tables"]["notes"]["Row"]
export type NoteInsert = Database["public"]["Tables"]["notes"]["Insert"]
export type NoteUpdate = Database["public"]["Tables"]["notes"]["Update"]

export type NoteSummary = Note & {
  subject_name?: string
}

