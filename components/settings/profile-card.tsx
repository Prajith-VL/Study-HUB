"use client"

import { useTransition } from "react"

import { Loader2 } from "lucide-react"

import { updateProfile } from "@/app/(app)/settings/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast"

type ProfileCardProps = {
  email: string
  fullName: string
}

export function ProfileCard({ email, fullName }: ProfileCardProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardHeader>
        <CardTitle className="text-white">Profile</CardTitle>
        <CardDescription>Update your account metadata synced with Supabase Auth.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            const formData = new FormData(event.currentTarget)
            startTransition(async () => {
              const result = await updateProfile(formData)
              if (!result.success) {
                toast({ title: "Profile update failed", description: result.error, variant: "error" })
                return
              }
              toast({ title: "Profile updated", variant: "success" })
            })
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" name="fullName" defaultValue={fullName} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled />
          </div>
          <Button type="submit" disabled={isPending} className="rounded-full bg-[#b784ff] text-black hover:bg-[#c697ff]">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

