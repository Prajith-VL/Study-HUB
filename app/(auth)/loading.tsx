import { Skeleton } from "@/components/ui/skeleton"

export default function AuthLoading() {
  return (
    <div className="mx-auto w-full max-w-[420px] rounded-2xl border border-white/10 bg-[#10111acc]/90 p-6">
      <div className="space-y-3">
        <Skeleton className="mx-auto h-10 w-3/4" />
        <Skeleton className="mx-auto h-4 w-1/2" />
      </div>
      <div className="mt-7 space-y-4">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    </div>
  )
}

