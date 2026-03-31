import { cn } from "@/lib/utils"

type BrandLogoProps = {
  compact?: boolean
  className?: string
}

export function BrandLogo({ compact = false, className }: BrandLogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(183,132,255,0.28),rgba(93,76,191,0.22))] shadow-[0_10px_30px_-12px_rgba(183,132,255,0.75)]">
        <div className="absolute inset-1 rounded-[10px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_40%),linear-gradient(180deg,rgba(183,132,255,0.55),rgba(67,56,202,0.38))]" />
        <div className="relative text-lg font-semibold tracking-tight text-white">SH</div>
      </div>

      {!compact ? (
        <div className="leading-none">
          <div className="text-base font-semibold tracking-wide text-primary">Study Hub</div>
          <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-zinc-500">Academic Workspace</div>
        </div>
      ) : null}
    </div>
  )
}
