"use client"

import Link from "next/link"
import type { Route } from "next"
import { useEffect, useMemo, useState } from "react"

import { Search } from "lucide-react"

import { useDebouncedValue } from "@/lib/hooks/use-debounced-value"

type SearchResult = {
  subjects: Array<{ id: string; name: string; semester: string }>
  notes: Array<{ id: string; title: string; subject_id: string }>
  tasks: Array<{ id: string; title: string; subject_id: string; status: string }>
  videos: Array<{ id: string; title: string; subject_id: string }>
  resources: Array<{ id: string; title: string; subject_id: string; resource_type: string }>
}

const EMPTY_RESULTS: SearchResult = { subjects: [], notes: [], tasks: [], videos: [], resources: [] }

const QUICK_ACTIONS: Array<{ label: string; href: Route }> = [
  { label: "Create Note", href: "/notes" },
  { label: "Create Task", href: "/planner" },
  { label: "Open Subjects", href: "/subjects" },
  { label: "Continue Learning", href: "/dashboard" }
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult>(EMPTY_RESULTS)
  const debounced = useDebouncedValue(query, 260)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((prev) => !prev)
      }
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    const openFromUi = () => setOpen(true)
    window.addEventListener("open-command-palette", openFromUi as EventListener)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("open-command-palette", openFromUi as EventListener)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    if (!debounced.trim()) {
      setResults(EMPTY_RESULTS)
      return
    }
    const controller = new AbortController()
    fetch(`/api/search?q=${encodeURIComponent(debounced)}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Search request failed with ${res.status}`)
        }
        return (await res.json()) as SearchResult
      })
      .then((data) => setResults(data))
      .catch(() => undefined)
    return () => controller.abort()
  }, [debounced, open])

  useEffect(() => {
    if (!open) {
      setQuery("")
      setResults(EMPTY_RESULTS)
    }
  }, [open])

  const hasResults = useMemo(
    () => results.subjects.length || results.notes.length || results.tasks.length || results.videos.length || results.resources.length,
    [results]
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[65] flex items-start justify-center p-4 pt-20">
      <button type="button" aria-label="Close command palette" className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={() => setOpen(false)} />

      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0f1422f2] p-3 shadow-2xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search subjects, notes, tasks, videos, resources..."
            className="h-11 w-full rounded-lg border border-white/10 bg-black/45 pl-9 pr-3 text-sm text-zinc-200 outline-none focus:ring-2 focus:ring-primary/60"
          />
        </div>

        <div className="mt-3 max-h-[65vh] space-y-4 overflow-y-auto p-1">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.16em] text-zinc-500">Quick Actions</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-200 transition-colors hover:border-white/20 hover:bg-white/[0.07]"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          {query.trim() ? (
            hasResults ? (
              <div className="space-y-3">
                {results.subjects.map((item) => (
                  <Link
                    key={`subject-${item.id}`}
                    href={`/subjects/${item.id}` as Route}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-200 hover:border-white/20"
                  >
                    Subject: {item.name}
                  </Link>
                ))}
                {results.notes.map((item) => (
                  <Link
                    key={`note-${item.id}`}
                    href={`/notes/${item.id}` as Route}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-200 hover:border-white/20"
                  >
                    Note: {item.title}
                  </Link>
                ))}
                {results.tasks.map((item) => (
                  <Link
                    key={`task-${item.id}`}
                    href={"/planner"}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-200 hover:border-white/20"
                  >
                    Task: {item.title}
                  </Link>
                ))}
                {results.videos.map((item) => (
                  <Link
                    key={`video-${item.id}`}
                    href={`/subjects/${item.subject_id}` as Route}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-200 hover:border-white/20"
                  >
                    Video: {item.title}
                  </Link>
                ))}
                {results.resources.map((item) => (
                  <Link
                    key={`resource-${item.id}`}
                    href={`/subjects/${item.subject_id}/resources` as Route}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-200 hover:border-white/20"
                  >
                    Resource: {item.title}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-500">No matching results.</p>
            )
          ) : null}
        </div>
      </div>
    </div>
  )
}
