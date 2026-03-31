import { cache } from "react"

import { getCurrentUser, isRecoverableDbError } from "@/lib/subjects/queries"
import { createClient } from "@/lib/supabase/server"

type SubjectRow = {
  id: string
  name: string
  progress: number
}

type TaskRow = {
  id: string
  subject_id: string
  title: string
  due_date: string
  status: "todo" | "in_progress" | "completed"
  created_at: string
}

type NoteRow = {
  id: string
  subject_id: string
  title: string
  created_at: string
  updated_at: string
}

type VideoRow = {
  id: string
  subject_id: string
  total_videos: number
  completed_videos: number
  last_watched: string | null
}

type ResourceRow = {
  id: string
  subject_id: string
  title: string
  resource_type: string
  created_at: string
}

export type StreakStats = {
  currentStreak: number
  longestStreak: number
  weeklyConsistency: number
}

export type AnalyticsSnapshot = {
  totals: {
    totalSubjects: number
    totalNotes: number
    completedTasks: number
    pendingTasks: number
    overdueTasks: number
    videoCompletionPercent: number
    pendingSyllabusPercent: number
  }
  weeklyTaskCompletion: Array<{ day: string; completed: number }>
  noteActivityTrend: Array<{ day: string; created: number }>
  subjectProgress: Array<{ name: string; progress: number }>
  mostActiveSubject: string | null
  neglectedSubject: string | null
  recentResources: Array<{ id: string; title: string; type: string; createdAt: string; subjectId: string }>
  quickInsights: string[]
  streak: StreakStats
}

function lastNDates(days: number): Date[] {
  const today = new Date()
  const dates: Date[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setHours(0, 0, 0, 0)
    d.setDate(today.getDate() - i)
    dates.push(d)
  }
  return dates
}

function ymd(date: Date) {
  return date.toISOString().slice(0, 10)
}

function safeDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function computeStreakStats(tasks: TaskRow[], notes: NoteRow[], videos: VideoRow[]): StreakStats {
  const activityDays = new Set<string>()

  tasks.forEach((task) => {
    if (task.status === "completed") {
      const d = safeDate(task.created_at)
      if (d) activityDays.add(ymd(d))
    }
  })
  notes.forEach((note) => {
    const d = safeDate(note.updated_at)
    if (d) activityDays.add(ymd(d))
  })
  videos.forEach((video) => {
    const d = safeDate(video.last_watched)
    if (d) activityDays.add(ymd(d))
  })

  const sorted = Array.from(activityDays).sort()
  let longest = 0
  let running = 0
  let previous: Date | null = null

  for (const day of sorted) {
    const current = new Date(day)
    if (!previous) {
      running = 1
    } else {
      const diff = Math.round((+current - +previous) / (1000 * 60 * 60 * 24))
      running = diff === 1 ? running + 1 : 1
    }
    if (running > longest) longest = running
    previous = current
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let currentStreak = 0
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    if (activityDays.has(ymd(d))) {
      currentStreak += 1
    } else {
      break
    }
  }

  const week = lastNDates(7)
  const activeWeekDays = week.filter((d) => activityDays.has(ymd(d))).length
  const weeklyConsistency = Math.round((activeWeekDays / 7) * 100)

  return {
    currentStreak,
    longestStreak: longest,
    weeklyConsistency
  }
}

export const getAnalyticsSnapshot = cache(async (): Promise<AnalyticsSnapshot> => {
  const user = await getCurrentUser()
  if (!user) {
    return {
      totals: {
        totalSubjects: 0,
        totalNotes: 0,
        completedTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
        videoCompletionPercent: 0,
        pendingSyllabusPercent: 0
      },
      weeklyTaskCompletion: [],
      noteActivityTrend: [],
      subjectProgress: [],
      mostActiveSubject: null,
      neglectedSubject: null,
      recentResources: [],
      quickInsights: [],
      streak: { currentStreak: 0, longestStreak: 0, weeklyConsistency: 0 }
    }
  }

  const supabase = await createClient()
  const [subjectsRes, notesRes, tasksRes, videosRes, resourcesRes] = await Promise.all([
    supabase.from("subjects").select("id,name,progress").eq("user_id", user.id),
    supabase.from("notes").select("id,subject_id,title,created_at,updated_at").eq("user_id", user.id),
    supabase.from("tasks").select("id,subject_id,title,due_date,status,created_at").eq("user_id", user.id),
    supabase.from("videos").select("id,subject_id,total_videos,completed_videos,last_watched").eq("user_id", user.id),
    supabase
      .from("subject_resources")
      .select("id,subject_id,title,resource_type,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8)
  ])

  if (subjectsRes.error && !isRecoverableDbError(subjectsRes.error)) throw new Error(subjectsRes.error.message)
  if (notesRes.error && !isRecoverableDbError(notesRes.error)) throw new Error(notesRes.error.message)
  if (tasksRes.error && !isRecoverableDbError(tasksRes.error)) throw new Error(tasksRes.error.message)
  if (videosRes.error && !isRecoverableDbError(videosRes.error)) throw new Error(videosRes.error.message)
  if (resourcesRes.error && !isRecoverableDbError(resourcesRes.error)) throw new Error(resourcesRes.error.message)

  const subjects = (subjectsRes.data ?? []) as SubjectRow[]
  const notes = (notesRes.data ?? []) as NoteRow[]
  const tasks = (tasksRes.data ?? []) as TaskRow[]
  const videos = (videosRes.data ?? []) as VideoRow[]
  const resources = (resourcesRes.data ?? []) as ResourceRow[]

  const completedTasks = tasks.filter((task) => task.status === "completed")
  const pendingTasks = tasks.filter((task) => task.status !== "completed")
  const overdueTasks = pendingTasks.filter((task) => safeDate(task.due_date) && +new Date(task.due_date) < Date.now())

  const totalVideos = videos.reduce((sum, video) => sum + video.total_videos, 0)
  const completedVideos = videos.reduce((sum, video) => sum + video.completed_videos, 0)
  const videoCompletionPercent = totalVideos ? Math.round((completedVideos / totalVideos) * 100) : 0

  const syllabusBySubject = new Set(
    resources.filter((resource) => resource.resource_type === "syllabus_pdf").map((resource) => resource.subject_id)
  )
  const pendingSyllabusPercent = subjects.length
    ? Math.round(((subjects.length - syllabusBySubject.size) / subjects.length) * 100)
    : 0

  const weeklyDates = lastNDates(7)
  const weeklyTaskCompletion = weeklyDates.map((date) => {
    const key = ymd(date)
    const completed = completedTasks.filter((task) => ymd(new Date(task.created_at)) === key).length
    return {
      day: date.toLocaleDateString(undefined, { weekday: "short" }),
      completed
    }
  })

  const noteActivityTrend = weeklyDates.map((date) => {
    const key = ymd(date)
    const created = notes.filter((note) => ymd(new Date(note.created_at)) === key).length
    return {
      day: date.toLocaleDateString(undefined, { weekday: "short" }),
      created
    }
  })

  const subjectProgress = subjects.map((subject) => ({
    name: subject.name,
    progress: subject.progress
  }))

  const subjectActivity = new Map<string, number>()
  for (const subject of subjects) subjectActivity.set(subject.id, 0)
  notes.forEach((note) => subjectActivity.set(note.subject_id, (subjectActivity.get(note.subject_id) ?? 0) + 2))
  tasks.forEach((task) => subjectActivity.set(task.subject_id, (subjectActivity.get(task.subject_id) ?? 0) + 1))
  videos.forEach((video) => subjectActivity.set(video.subject_id, (subjectActivity.get(video.subject_id) ?? 0) + 2))
  resources.forEach((resource) => subjectActivity.set(resource.subject_id, (subjectActivity.get(resource.subject_id) ?? 0) + 1))

  const ranked = subjects
    .map((subject) => ({
      name: subject.name,
      score: subjectActivity.get(subject.id) ?? 0
    }))
    .sort((a, b) => b.score - a.score)

  const mostActiveSubject = ranked[0]?.score ? ranked[0].name : null
  const neglectedSubject = ranked.length ? ranked[ranked.length - 1].name : null

  const streak = computeStreakStats(tasks, notes, videos)

  const quickInsights: string[] = []
  if (streak.currentStreak >= 3) quickInsights.push(`Great momentum: ${streak.currentStreak}-day active streak.`)
  if (overdueTasks.length > 0) quickInsights.push(`${overdueTasks.length} overdue task(s) need attention.`)
  if (pendingSyllabusPercent > 0) quickInsights.push(`${pendingSyllabusPercent}% of subjects still need syllabus upload.`)
  if (videoCompletionPercent >= 70) quickInsights.push("Video completion is strong this cycle.")
  if (!quickInsights.length) quickInsights.push("Steady progress. Add notes and complete tasks to unlock richer insights.")

  return {
    totals: {
      totalSubjects: subjects.length,
      totalNotes: notes.length,
      completedTasks: completedTasks.length,
      pendingTasks: pendingTasks.length,
      overdueTasks: overdueTasks.length,
      videoCompletionPercent,
      pendingSyllabusPercent
    },
    weeklyTaskCompletion,
    noteActivityTrend,
    subjectProgress,
    mostActiveSubject,
    neglectedSubject,
    recentResources: resources.map((resource) => ({
      id: resource.id,
      title: resource.title,
      type: resource.resource_type,
      createdAt: resource.created_at,
      subjectId: resource.subject_id
    })),
    quickInsights,
    streak
  }
})

