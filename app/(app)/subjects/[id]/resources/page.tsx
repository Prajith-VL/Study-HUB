import Link from "next/link"
import type { Route } from "next"

import { ResourceFormModal } from "@/components/resources/resource-form-modal"
import { ResourcesTable } from "@/components/resources/resources-table"
import { SubjectDetailNav } from "@/components/subjects/subject-detail-nav"
import { RESOURCE_TYPE_FILTERS, type ResourceTypeFilter } from "@/lib/subjects/constants"
import { getSubjectResources } from "@/lib/subjects/queries"
import { toResourceView } from "@/lib/subjects/serializers"
import type { ResourceType } from "@/lib/subjects/types"

type SubjectResourcesPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ type?: string }>
}

function isResourceType(value: string): value is ResourceType {
  const supported: ResourceType[] = [
    "course_link",
    "youtube_playlist",
    "github_repo",
    "drive_link",
    "syllabus_pdf",
    "pyq_pdf",
    "ebook_pdf"
  ]
  return supported.includes(value as ResourceType)
}

export default async function SubjectResourcesPage({ params, searchParams }: SubjectResourcesPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams])
  const filter = (query.type ?? "all") as ResourceTypeFilter
  const resourceType = filter !== "all" && isResourceType(filter) ? filter : undefined

  const resources = await getSubjectResources(id, resourceType)
  const resourceViews = await Promise.all(resources.map((resource) => toResourceView(resource)))

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SubjectDetailNav subjectId={id} active="resources" />
        <ResourceFormModal subjectId={id} />
      </div>

      <div className="flex flex-wrap gap-2">
        {RESOURCE_TYPE_FILTERS.map((filterValue) => (
          <Link
            key={filterValue}
            href={`/subjects/${id}/resources${filterValue === "all" ? "" : `?type=${filterValue}`}` as Route}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              filter === filterValue
                ? "border-primary/40 bg-primary/20 text-primary"
                : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
            }`}
          >
            {filterValue === "all" ? "All" : filterValue.replace(/_/g, " ")}
          </Link>
        ))}
      </div>

      <ResourcesTable resources={resourceViews} />
    </div>
  )
}

