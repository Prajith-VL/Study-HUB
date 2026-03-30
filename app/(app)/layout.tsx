import { redirect } from "next/navigation"
import type { ReactNode } from "react"

import { AppShell } from "@/components/app-shell/app-shell"
import { createClient } from "@/lib/supabase/server"

import { logout } from "./actions"

type AppLayoutProps = {
  children: ReactNode
}

export default async function ProtectedAppLayout({ children }: AppLayoutProps) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return <AppShell userEmail={user.email ?? "unknown@studyhub.app"} logoutAction={logout}>{children}</AppShell>
}
