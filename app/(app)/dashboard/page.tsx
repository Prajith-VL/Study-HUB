import Link from "next/link"
import type { Route } from "next"

import { ArrowRight } from "lucide-react"

import { PageHeader } from "@/components/app-shell/page-header"
import { ContinueLearningCard } from "@/components/dashboard/continue-learning-card"
import { NoteCreateModal } from "@/components/notes/note-create-modal"
import { RecentNotesWidget } from "@/components/notes/recent-notes-widget"
import { TaskFormModal } from "@/components/planner/task-form-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAnalyticsSnapshot } from "@/lib/analytics/queries"
import { getRecentNotes } from "@/lib/notes/queries"
import { getDueTodayTasks, getUpcomingDeadlines } from "@/lib/planner/queries"
import { getSubjects } from "@/lib/subjects/queries"
import { getContinueLearningVideo } from "@/lib/videos/queries"

export default async function DashboardPage() {
  const [subjects, dueToday, upcoming, recentNotes, continueLearning, analytics] = await Promise.all([
    getSubjects(),
    getDueTodayTasks(),
    getUpcomingDeadlines(6),
    getRecentNotes(5),
    getContinueLearningVideo(),
    getAnalyticsSnapshot()
  ])

  const subjectOptions = subjects.map((subject) => ({ id: subject.id, name: subject.name }))

  return (
    <div className="space-y-8 card-reveal">
      <PageHeader
        title="Dashboard"
        subtitle="Smart command center for focus, planning, and deep progress visibility."
        actions={
          <>
            <NoteCreateModal subjects={subjectOptions} triggerLabel="Quick Note" compact />
            <TaskFormModal subjects={subjectOptions} label="Quick Task" compact />
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-white/10 bg-white/[0.03] transition-transform duration-200 hover:-translate-y-0.5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-white">{analytics.totals.totalSubjects}</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/[0.03] transition-transform duration-200 hover:-translate-y-0.5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-white">{analytics.totals.totalNotes}</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/[0.03] transition-transform duration-200 hover:-translate-y-0.5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Completed Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-white">{analytics.totals.completedTasks}</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/[0.03] transition-transform duration-200 hover:-translate-y-0.5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Pending Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-white">{analytics.totals.pendingTasks}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Card className="border-white/10 bg-white/[0.03]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Due Today</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {!dueToday.length ? (
                <p className="text-sm text-zinc-500">No due tasks today.</p>
              ) : (
                dueToday.map((task) => (
                  <div key={task.id} className="rounded-lg border border-white/10 px-3 py-2">
                    <p className="text-sm text-zinc-200">{task.title}</p>
                    <p className="text-xs text-zinc-500">{new Date(task.due_date).toLocaleTimeString()}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/[0.03]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Upcoming Exams / Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {!upcoming.length ? (
                <p className="text-sm text-zinc-500">No upcoming deadlines.</p>
              ) : (
                upcoming.map((task) => (
                  <div key={task.id} className="rounded-lg border border-white/10 px-3 py-2">
                    <p className="text-sm text-zinc-200">{task.title}</p>
                    <p className="text-xs text-zinc-500">{new Date(task.due_date).toLocaleString()}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-white/10 bg-white/[0.03]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Study Streak</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-2xl font-semibold text-white">{analytics.streak.currentStreak} days</p>
              <p className="text-sm text-zinc-400">Longest: {analytics.streak.longestStreak} days</p>
              <p className="text-sm text-zinc-400">Weekly consistency: {analytics.streak.weeklyConsistency}%</p>
            </CardContent>
          </Card>
          <ContinueLearningCard video={continueLearning} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <RecentNotesWidget notes={recentNotes} />

        <Card className="border-white/10 bg-white/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Quick Open Subject</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!subjects.length ? (
              <p className="text-sm text-zinc-500">No subjects available yet.</p>
            ) : (
              subjects.slice(0, 6).map((subject) => (
                <Button key={subject.id} asChild variant="secondary" className="w-full justify-between bg-white/10 hover:bg-white/20">
                  <Link href={`/subjects/${subject.id}` as Route}>
                    {subject.name}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Recent Uploaded Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!analytics.recentResources.length ? (
              <p className="text-sm text-zinc-500">No uploads yet.</p>
            ) : (
              analytics.recentResources.slice(0, 6).map((item) => (
                <Link
                  key={item.id}
                  href={`/subjects/${item.subjectId}/resources` as Route}
                  className="block rounded-lg border border-white/10 px-3 py-2 transition-colors hover:border-white/20"
                >
                  <p className="truncate text-sm text-zinc-200">{item.title}</p>
                  <p className="text-xs text-zinc-500">{item.type.replace(/_/g, " ")}</p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <Card className="border-white/10 bg-white/[0.03]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-400">Productivity Insights</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          {analytics.quickInsights.map((insight) => (
            <div key={insight} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300">
              {insight}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
