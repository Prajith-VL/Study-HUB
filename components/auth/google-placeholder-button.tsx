import { Chrome } from "lucide-react"

import { Button } from "@/components/ui/button"

type GooglePlaceholderButtonProps = {
  label?: string
  onClick?: () => void
  disabled?: boolean
}

export function GooglePlaceholderButton({ label = "Google", onClick, disabled }: GooglePlaceholderButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className="h-11 w-full border-white/10 bg-white/[0.03] text-foreground/90 hover:border-primary/40 hover:bg-white/[0.06]"
      onClick={onClick}
      disabled={disabled}
    >
      <Chrome className="h-4 w-4" />
      {label}
    </Button>
  )
}
