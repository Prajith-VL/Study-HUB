import Link from "next/link"
import type { Route } from "next"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type RecentNote = {
  id: string
  title: string
  updated_at: string
}

type RecentNotesWidgetProps = {
  notes: RecentNote[]
}

export function RecentNotesWidget({ notes }: RecentNotesWidgetProps) {
  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-zinc-400">Recent Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!notes.length ? (
          <p className="text-sm text-zinc-500">No notes yet.</p>
        ) : (
          notes.map((note) => (
            <Link
              key={note.id}
              href={`/notes/${note.id}` as Route}
              className="block rounded-lg border border-white/10 px-3 py-2 transition-colors hover:border-white/20 hover:bg-white/[0.04]"
            >
              <p className="truncate text-sm font-medium text-white">{note.title}</p>
              <p className="mt-0.5 text-xs text-zinc-500">{new Date(note.updated_at).toLocaleString()}</p>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  )
}

