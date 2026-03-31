import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.trim() ?? ""
  if (!q) {
    return NextResponse.json({
      subjects: [],
      notes: [],
      tasks: [],
      videos: [],
      resources: []
    })
  }

  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const db = supabase as any
  const pattern = `%${q}%`
  const [subjects, notes, tasks, videos, resources] = await Promise.all([
    db.from("subjects").select("id,name,semester").eq("user_id", user.id).ilike("name", pattern).limit(5),
    db.from("notes").select("id,title,subject_id").eq("user_id", user.id).ilike("title", pattern).limit(5),
    db.from("tasks").select("id,title,subject_id,status").eq("user_id", user.id).ilike("title", pattern).limit(5),
    db.from("videos").select("id,title,subject_id").eq("user_id", user.id).ilike("title", pattern).limit(5),
    db.from("subject_resources").select("id,title,subject_id,resource_type").eq("user_id", user.id).ilike("title", pattern).limit(5)
  ])

  return NextResponse.json({
    subjects: subjects.data ?? [],
    notes: notes.data ?? [],
    tasks: tasks.data ?? [],
    videos: videos.data ?? [],
    resources: resources.data ?? []
  })
}
