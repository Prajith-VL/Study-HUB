import { redirect } from "next/navigation"

import { PageHeader } from "@/components/app-shell/page-header"
import { PreferencesCard } from "@/components/settings/preferences-card"
import { ProfileCard } from "@/components/settings/profile-card"
import { createClient } from "@/lib/supabase/server"

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return (
    <div className="space-y-8 card-reveal">
      <PageHeader title="Settings" subtitle="Manage account details and workspace preferences." />

      <section className="grid gap-4 xl:grid-cols-2">
        <ProfileCard email={user.email ?? ""} fullName={(user.user_metadata?.full_name as string) ?? ""} />
        <PreferencesCard />
      </section>
    </div>
  )
}