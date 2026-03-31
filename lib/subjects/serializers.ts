import { getSignedResourceUrl } from "@/lib/subjects/queries"
import { RESOURCE_PRIORITY_LABELS, RESOURCE_TYPE_LABELS, type Resource } from "@/lib/subjects/types"

export type ResourceView = {
  id: string
  subjectId: string
  title: string
  typeLabel: string
  priorityLabel: string
  unitLabel: string | null
  topicLabel: string | null
  url: string | null
  createdAt: string
  isFavorite: boolean
}

export async function toResourceView(resource: Resource): Promise<ResourceView> {
  const signedOrDirectUrl = await getSignedResourceUrl(resource)
  return {
    id: resource.id,
    subjectId: resource.subject_id,
    title: resource.title,
    typeLabel: RESOURCE_TYPE_LABELS[resource.resource_type],
    priorityLabel: RESOURCE_PRIORITY_LABELS[resource.priority],
    unitLabel: resource.unit_label,
    topicLabel: resource.topic_label,
    url: signedOrDirectUrl,
    createdAt: resource.created_at,
    isFavorite: (resource as unknown as { is_favorite?: boolean }).is_favorite ?? false
  }
}
