import { PageHeader } from "@/components/app-shell/page-header"
import { PlannerBoard } from "@/components/planner/planner-board"
import { TaskFormModal } from "@/components/planner/task-form-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDueTodayTasks, getTasks, getUpcomingDeadlines } from "@/lib/planner/queries"
import { getSubjects } from "@/lib/subjects/queries"

export default async function PlannerPage() {
  const [tasks, dueToday, upcoming, subjects] = await Promise.all([
    getTasks(),
    getDueTodayTasks(),
    getUpcomingDeadlines(),
    getSubjects()
  ])

  const subjectOptions = subjects.map((subject) => ({ id: subject.id, name: subject.name }))

  return (
    <div className="space-y-8">
      <PageHeader
        title="Planner"
        subtitle="Task + revision workflow with due-date grouping and completion tracking."
        actions={<TaskFormModal subjects={subjectOptions} label="Add Task" />}
      />

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="border-white/10 bg-white/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Due Today</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!dueToday.length ? (
              <p className="text-sm text-zinc-500">No tasks due today.</p>
            ) : (
              dueToday.map((task) => (
                <div key={task.id} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300">
                  {task.title}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!upcoming.length ? (
              <p className="text-sm text-zinc-500">No upcoming deadlines.</p>
            ) : (
              upcoming.map((task) => (
                <div key={task.id} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300">
                  <p>{task.title}</p>
                  <p className="text-xs text-zinc-500">{new Date(task.due_date).toLocaleString()}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <PlannerBoard initialTasks={tasks} subjects={subjectOptions} />
    </div>
  )
}