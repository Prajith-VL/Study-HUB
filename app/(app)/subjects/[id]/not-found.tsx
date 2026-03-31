import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function SubjectNotFound() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
      <h2 className="text-2xl font-semibold text-white">Subject not found</h2>
      <p className="mt-2 text-sm text-zinc-400">This subject may have been deleted or you do not have access.</p>
      <Button asChild className="mt-5 rounded-full bg-[#b784ff] text-black hover:bg-[#c697ff]">
        <Link href="/subjects">Back to Subjects</Link>
      </Button>
    </div>
  )
}

