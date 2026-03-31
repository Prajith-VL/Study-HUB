import { Activity, AlertTriangle, Brain, Flame, Target } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type InsightCardsProps = {
  completedTasks: number
  pendingTasks: number
  videoCompletionPercent: number
  overdueTasks: number
  pendingSyllabusPercent: number
  mostActiveSubject: string | null
  neglectedSubject: string | null
  streak: {
    currentStreak: number
    longestStreak: number
    weeklyConsistency: number
  }
}

export function InsightCards({
  completedTasks,
  pendingTasks,
  videoCompletionPercent,
  overdueTasks,
  pendingSyllabusPercent,
  mostActiveSubject,
  neglectedSubject,
  streak
}: InsightCardsProps) {
  const cards = [
    { title: "Completed vs Pending", value: `${completedTasks} / ${pendingTasks}`, icon: Target },
    { title: "Video Completion", value: `${videoCompletionPercent}%`, icon: Activity },
    { title: "Overdue Tasks", value: `${overdueTasks}`, icon: AlertTriangle },
    { title: "Pending Syllabus", value: `${pendingSyllabusPercent}%`, icon: Brain },
    { title: "Current Streak", value: `${streak.currentStreak} days`, icon: Flame },
    { title: "Weekly Consistency", value: `${streak.weeklyConsistency}%`, icon: Activity }
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title} className="border-white/10 bg-white/[0.03] transition-transform duration-200 hover:-translate-y-0.5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-white">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-white/10 bg-white/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Most Active Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-white">{mostActiveSubject ?? "Not enough data yet"}</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Neglected Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-white">{neglectedSubject ?? "Not enough data yet"}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

