import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type FoundationSectionProps = {
  title: string
  description: string
  points: string[]
}

export function FoundationSection({ title, description, points }: FoundationSectionProps) {
  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardHeader>
        <CardTitle className="text-lg text-white">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-zinc-300">
          {points.map((point) => (
            <li key={point} className="rounded-md border border-white/5 bg-white/[0.02] px-3 py-2">
              {point}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

