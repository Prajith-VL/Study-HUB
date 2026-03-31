"use client"

import { useMemo, useState, useTransition } from "react"

import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SUBJECT_COLOR_OPTIONS } from "@/lib/subjects/constants"
import { SEMESTER_OPTIONS, type Subject } from "@/lib/subjects/types"

type SubjectFormValues = {
  id?: string
  name: string
  semester: string
  color: string
  progress: number
}

type SubjectFormProps = {
  initialValues?: Subject
  submitLabel: string
  onSubmit: (formData: FormData, optimisticValues: SubjectFormValues) => Promise<void>
}

export function SubjectForm({ initialValues, submitLabel, onSubmit }: SubjectFormProps) {
  const [isPending, startTransition] = useTransition()
  const [progress, setProgress] = useState(initialValues?.progress ?? 0)
  const defaultColor = initialValues?.color ?? SUBJECT_COLOR_OPTIONS[0]

  const optimisticValues = useMemo(
    () => ({
      id: initialValues?.id,
      name: initialValues?.name ?? "",
      semester: initialValues?.semester ?? SEMESTER_OPTIONS[0],
      color: defaultColor,
      progress
    }),
    [defaultColor, initialValues?.id, initialValues?.name, initialValues?.semester, progress]
  )

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        startTransition(async () => {
          await onSubmit(formData, optimisticValues)
        })
      }}
    >
      {initialValues?.id ? <input type="hidden" name="id" value={initialValues.id} /> : null}

      <div className="space-y-2">
        <Label htmlFor="name">Subject Name</Label>
        <Input id="name" name="name" defaultValue={initialValues?.name ?? ""} placeholder="Operating Systems" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="semester">Semester</Label>
        <select
          id="semester"
          name="semester"
          defaultValue={initialValues?.semester ?? SEMESTER_OPTIONS[0]}
          className="flex h-11 w-full rounded-md border border-border/60 bg-black/60 px-3 py-2 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
        >
          {SEMESTER_OPTIONS.map((semester) => (
            <option key={semester} value={semester}>
              {semester}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="color">Card Color</Label>
        <div className="flex flex-wrap gap-2">
          {SUBJECT_COLOR_OPTIONS.map((color) => (
            <label
              key={color}
              className="relative inline-flex cursor-pointer items-center justify-center"
              title={color}
              style={{ color }}
            >
              <input
                type="radio"
                name="color"
                value={color}
                defaultChecked={color === defaultColor}
                className="peer sr-only"
              />
              <span className="h-8 w-8 rounded-full border border-white/20 transition-transform duration-200 peer-checked:scale-110 peer-checked:ring-2 peer-checked:ring-white/80" style={{ backgroundColor: color }} />
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="progress">Progress</Label>
          <span className="text-sm text-zinc-300">{progress}%</span>
        </div>
        <input
          id="progress"
          name="progress"
          type="range"
          min={0}
          max={100}
          step={1}
          value={progress}
          onChange={(event) => setProgress(Number(event.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-700 accent-primary"
        />
      </div>

      <Button type="submit" disabled={isPending} className="h-11 w-full rounded-full bg-[#b784ff] text-black hover:bg-[#c697ff]">
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {submitLabel}
      </Button>
    </form>
  )
}

