import { PageHeader } from "@/components/app-shell/page-header"
import { SubjectsBoard } from "@/components/subjects/subjects-board"
import { getSubjects } from "@/lib/subjects/queries"

export default async function SubjectsPage() {
  const subjects = await getSubjects()

  return (
    <div className="space-y-8">
      <PageHeader title="Subjects" subtitle="Create, organize, and track semester progress for every subject." />
      <SubjectsBoard initialSubjects={subjects} />
    </div>
  )
}