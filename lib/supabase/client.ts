import { createBrowserClient } from "@supabase/ssr"

import { getPublicEnvOrThrow } from "@/lib/env"
import type { Database } from "@/types/database"

export function createClient() {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = getPublicEnvOrThrow()

  return createBrowserClient<Database>(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
}
