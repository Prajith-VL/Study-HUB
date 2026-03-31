import { AnalyticsCharts } from "@/components/analytics/analytics-charts"
import { InsightCards } from "@/components/analytics/insight-cards"
import { PageHeader } from "@/components/app-shell/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAnalyticsSnapshot } from "@/lib/analytics/queries"

export default async function AnalyticsPage() {
  const analytics = await getAnalyticsSnapshot()

  return (
    <div className="space-y-8 card-reveal">
      <PageHeader
        title="Analytics"
        subtitle="Weekly completion, subject momentum, streak behavior, and productivity intelligence."
      />

      <InsightCards
        completedTasks={analytics.totals.completedTasks}
        pendingTasks={analytics.totals.pendingTasks}
        videoCompletionPercent={analytics.totals.videoCompletionPercent}
        overdueTasks={analytics.totals.overdueTasks}
        pendingSyllabusPercent={analytics.totals.pendingSyllabusPercent}
        mostActiveSubject={analytics.mostActiveSubject}
        neglectedSubject={analytics.neglectedSubject}
        streak={analytics.streak}
      />

      <AnalyticsCharts
        weeklyTaskCompletion={analytics.weeklyTaskCompletion}
        noteActivityTrend={analytics.noteActivityTrend}
        subjectProgress={analytics.subjectProgress}
        taskStatusBreakdown={[
          { name: "Completed", value: analytics.totals.completedTasks },
          { name: "Pending", value: analytics.totals.pendingTasks }
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="border-white/10 bg-white/[0.03] xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Quick Productivity Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {analytics.quickInsights.map((insight) => (
              <div key={insight} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300">
                {insight}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Recent Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!analytics.recentResources.length ? (
              <p className="text-sm text-zinc-500">No recent uploads yet.</p>
            ) : (
              analytics.recentResources.slice(0, 6).map((resource) => (
                <div key={resource.id} className="rounded-lg border border-white/10 px-3 py-2">
                  <p className="truncate text-sm text-zinc-200">{resource.title}</p>
                  <p className="text-xs text-zinc-500">{resource.type.replace(/_/g, " ")}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
