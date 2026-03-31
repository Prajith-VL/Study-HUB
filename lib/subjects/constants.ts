import type { ResourceType } from "@/lib/subjects/types"

export const SUBJECT_COLOR_OPTIONS = [
  "#A78BFA",
  "#8B5CF6",
  "#C084FC",
  "#22D3EE",
  "#34D399",
  "#F59E0B",
  "#F97316",
  "#F43F5E"
] as const

export const FILE_BUCKET_BY_TYPE: Record<ResourceType, "syllabus" | "pyqs" | "ebooks" | null> = {
  course_link: null,
  youtube_playlist: null,
  github_repo: null,
  drive_link: null,
  syllabus_pdf: "syllabus",
  pyq_pdf: "pyqs",
  ebook_pdf: "ebooks"
}

export const RESOURCE_TYPE_FILTERS = ["all", "course_link", "youtube_playlist", "github_repo", "drive_link", "syllabus_pdf", "pyq_pdf", "ebook_pdf"] as const

export type ResourceTypeFilter = (typeof RESOURCE_TYPE_FILTERS)[number]

