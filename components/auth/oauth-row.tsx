import { Apple } from "lucide-react"

import { GooglePlaceholderButton } from "@/components/auth/google-placeholder-button"
import { Button } from "@/components/ui/button"

type OAuthRowProps = {
  onGoogle?: () => void
  isGooglePending?: boolean
}

export function OAuthRow({ onGoogle, isGooglePending = false }: OAuthRowProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <GooglePlaceholderButton onClick={onGoogle} disabled={isGooglePending} />
      <Button
        type="button"
        variant="outline"
        className="h-11 border-white/10 bg-white/[0.03] text-foreground/90 hover:border-primary/40 hover:bg-white/[0.06]"
        disabled
        title="Apple auth is not configured yet."
      >
        <Apple className="h-4 w-4" />
        Apple
      </Button>
    </div>
  )
}
