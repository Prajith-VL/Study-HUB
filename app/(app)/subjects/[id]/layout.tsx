import Link from "next/link"
import type { ReactNode } from "react"
import { notFound } from "next/navigation"

import { ChevronLeft } from "lucide-react"

import { getSubjectById } from "@/lib/subjects/queries"

type SubjectDetailLayoutProps = {
  children: ReactNode
  params: Promise<{ id: string }>
}

export default async function SubjectDetailLayout({ children, params }: SubjectDetailLayoutProps) {
  const { id } = await params
  const subject = await getSubjectById(id)

  if (!subject) {
    notFound()
  }

  return (
    <div className="space-y-6 card-reveal">
      <div className="flex flex-col gap-3">
        <Link href="/subjects" className="inline-flex w-fit items-center gap-1 text-sm text-zinc-400 hover:text-zinc-200">
          <ChevronLeft className="h-4 w-4" />
          Back to subjects
        </Link>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{subject.semester}</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">{subject.name}</h1>
              <p className="mt-1 text-sm text-zinc-400">Subject workspace, resources, and syllabus vault.</p>
            </div>
            <div className="rounded-full border border-white/10 px-3 py-1 text-sm text-zinc-200">
              Progress: {subject.progress}%
            </div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-zinc-800">
            <div className="h-2 rounded-full transition-all duration-300" style={{ width: `${subject.progress}%`, backgroundColor: subject.color }} />
          </div>
        </div>
      </div>

      {children}
    </div>
  )
}

