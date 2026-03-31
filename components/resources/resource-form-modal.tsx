"use client"

import { useMemo, useState, useTransition } from "react"

import { Loader2, Plus } from "lucide-react"

import { createResource } from "@/app/(app)/subjects/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { useToast } from "@/components/ui/toast"
import {
  FILE_RESOURCE_TYPES,
  RESOURCE_PRIORITIES,
  RESOURCE_PRIORITY_LABELS,
  RESOURCE_TYPES,
  RESOURCE_TYPE_LABELS,
  type ResourceType
} from "@/lib/subjects/types"

type ResourceFormModalProps = {
  subjectId: string
}

export function ResourceFormModal({ subjectId }: ResourceFormModalProps) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<ResourceType>("course_link")
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const isFileType = useMemo(() => FILE_RESOURCE_TYPES.includes(type), [type])

  return (
    <>
      <Button
        className="h-10 rounded-full bg-[#b784ff] text-black hover:bg-[#c697ff] hover:shadow-[0_0_30px_-8px_#b784ff]"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" />
        Add Resource
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add Resource"
        description="Store links and PDFs in this subject vault."
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            const formData = new FormData(event.currentTarget)
            formData.set("subjectId", subjectId)
            startTransition(async () => {
              const result = await createResource(formData)
              if (!result.success) {
                toast({ title: "Could not add resource", description: result.error, variant: "error" })
                return
              }
              toast({ title: "Resource added", variant: "success" })
              setOpen(false)
            })
          }}
        >
          <input type="hidden" name="subjectId" value={subjectId} />

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="Unit 3 curated playlist" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resourceType">Resource Type</Label>
            <select
              id="resourceType"
              name="resourceType"
              value={type}
              onChange={(event) => setType(event.target.value as ResourceType)}
              className="flex h-11 w-full rounded-md border border-border/60 bg-black/60 px-3 py-2 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
            >
              {RESOURCE_TYPES.map((resourceType) => (
                <option key={resourceType} value={resourceType}>
                  {RESOURCE_TYPE_LABELS[resourceType]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                name="priority"
                defaultValue="medium"
                className="flex h-11 w-full rounded-md border border-border/60 bg-black/60 px-3 py-2 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
              >
                {RESOURCE_PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {RESOURCE_PRIORITY_LABELS[priority]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitLabel">Unit / Module</Label>
              <Input id="unitLabel" name="unitLabel" placeholder="Unit 4" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topicLabel">Topic</Label>
            <Input id="topicLabel" name="topicLabel" placeholder="CPU Scheduling" />
          </div>

          {isFileType ? (
            <div className="space-y-2">
              <Label htmlFor="file">Upload PDF</Label>
              <Input id="file" name="file" type="file" accept="application/pdf" required />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="url">Link URL</Label>
              <Input id="url" name="url" type="url" placeholder="https://..." required />
            </div>
          )}

          <Button type="submit" disabled={isPending} className="h-11 w-full rounded-full bg-[#b784ff] text-black hover:bg-[#c697ff]">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save Resource
          </Button>
        </form>
      </Modal>
    </>
  )
}

