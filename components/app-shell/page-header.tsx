import type { ReactNode } from "react"

type PageHeaderProps = {
  title: string
  subtitle: string
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-white/5 pb-6 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  )
}
