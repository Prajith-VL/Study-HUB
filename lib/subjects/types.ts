import type { Database } from "@/types/database"

export type Subject = Database["public"]["Tables"]["subjects"]["Row"]
export type SubjectInsert = Database["public"]["Tables"]["subjects"]["Insert"]
export type SubjectUpdate = Database["public"]["Tables"]["subjects"]["Update"]

export type Resource = Database["public"]["Tables"]["subject_resources"]["Row"]
export type ResourceInsert = Database["public"]["Tables"]["subject_resources"]["Insert"]

export type ResourceType = Database["public"]["Enums"]["resource_type"]
export type ResourcePriority = Database["public"]["Enums"]["resource_priority"]

export const RESOURCE_TYPES: ResourceType[] = [
  "course_link",
  "youtube_playlist",
  "github_repo",
  "drive_link",
  "syllabus_pdf",
  "pyq_pdf",
  "ebook_pdf"
]

export const RESOURCE_PRIORITIES: ResourcePriority[] = ["low", "medium", "high"]

export const FILE_RESOURCE_TYPES: ResourceType[] = ["syllabus_pdf", "pyq_pdf", "ebook_pdf"]
export const LINK_RESOURCE_TYPES: ResourceType[] = ["course_link", "youtube_playlist", "github_repo", "drive_link"]

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  course_link: "Course Link",
  youtube_playlist: "YouTube Playlist",
  github_repo: "GitHub Link",
  drive_link: "Drive Link",
  syllabus_pdf: "Syllabus PDF",
  pyq_pdf: "PYQ PDF",
  ebook_pdf: "Ebook PDF"
}

export const RESOURCE_PRIORITY_LABELS: Record<ResourcePriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High"
}

export const SEMESTER_OPTIONS = [
  "Semester 1",
  "Semester 2",
  "Semester 3",
  "Semester 4",
  "Semester 5",
  "Semester 6",
  "Semester 7",
  "Semester 8"
] as const

