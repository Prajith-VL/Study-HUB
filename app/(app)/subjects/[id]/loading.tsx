import { Skeleton } from "@/components/ui/skeleton"

export default function SubjectDetailLoading() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-10 w-72" />
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-36 w-full" />
    </div>
  )
}

