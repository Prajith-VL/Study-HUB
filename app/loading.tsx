import { Skeleton } from "@/components/ui/skeleton"

export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-3">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-44 w-full" />
      </div>
    </div>
  )
}

