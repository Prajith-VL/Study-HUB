"use client"

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type AnalyticsChartsProps = {
  weeklyTaskCompletion: Array<{ day: string; completed: number }>
  noteActivityTrend: Array<{ day: string; created: number }>
  subjectProgress: Array<{ name: string; progress: number }>
  taskStatusBreakdown: Array<{ name: string; value: number }>
}

const COLORS = ["#b784ff", "#8B5CF6", "#C084FC", "#22D3EE", "#34D399", "#F59E0B", "#F97316", "#F43F5E"]

export function AnalyticsCharts({ weeklyTaskCompletion, noteActivityTrend, subjectProgress, taskStatusBreakdown }: AnalyticsChartsProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card className="border-white/10 bg-white/[0.03] xl:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-400">Weekly Task Completion</CardTitle>
        </CardHeader>
        <CardContent className="h-64 sm:h-72">
          {!weeklyTaskCompletion.length ? (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500">No completion data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTaskCompletion}>
                <CartesianGrid strokeDasharray="3 3" stroke="#26293A" />
                <XAxis dataKey="day" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ background: "#0f1320", border: "1px solid #2c3245", borderRadius: 8 }} />
                <Bar dataKey="completed" fill="#b784ff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/[0.03]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-400">Subject Progress</CardTitle>
        </CardHeader>
        <CardContent className="h-64 sm:h-72">
          {!subjectProgress.length ? (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500">No subject data.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={subjectProgress} dataKey="progress" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={3}>
                  {subjectProgress.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#0f1320", border: "1px solid #2c3245", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/[0.03]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-400">Completed vs Pending Tasks</CardTitle>
        </CardHeader>
        <CardContent className="h-64 sm:h-72">
          {!taskStatusBreakdown.length ? (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500">No task status data.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={taskStatusBreakdown} dataKey="value" nameKey="name" innerRadius={55} outerRadius={92} paddingAngle={4}>
                  {taskStatusBreakdown.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#0f1320", border: "1px solid #2c3245", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/[0.03] xl:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-400">Note Creation Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-56 sm:h-60">
          {!noteActivityTrend.length ? (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500">No note activity yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={noteActivityTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#26293A" />
                <XAxis dataKey="day" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ background: "#0f1320", border: "1px solid #2c3245", borderRadius: 8 }} />
                <Bar dataKey="created" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
