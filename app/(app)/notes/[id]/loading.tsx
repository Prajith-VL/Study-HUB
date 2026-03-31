import { Skeleton } from "@/components/ui/skeleton"

export default function NoteDetailLoading() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-[520px] w-full" />
    </div>
  )
}

