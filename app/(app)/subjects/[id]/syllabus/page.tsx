import { ResourceFormModal } from "@/components/resources/resource-form-modal"
import { ResourcesTable } from "@/components/resources/resources-table"
import { SubjectDetailNav } from "@/components/subjects/subject-detail-nav"
import { getSubjectResources } from "@/lib/subjects/queries"
import { toResourceView } from "@/lib/subjects/serializers"

type SubjectSyllabusPageProps = {
  params: Promise<{ id: string }>
}

export default async function SubjectSyllabusPage({ params }: SubjectSyllabusPageProps) {
  const { id } = await params
  const resources = await getSubjectResources(id, "syllabus_pdf")
  const resourceViews = await Promise.all(resources.map((resource) => toResourceView(resource)))

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SubjectDetailNav subjectId={id} active="syllabus" />
        <ResourceFormModal subjectId={id} />
      </div>

      <ResourcesTable resources={resourceViews} />
    </div>
  )
}

