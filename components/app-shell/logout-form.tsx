"use client"

import { useFormStatus } from "react-dom"
import { LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="ghost" className="w-full justify-start px-2" disabled={pending}>
      <LogOut className="mr-2 h-4 w-4" />
      {pending ? "Signing out..." : "Logout"}
    </Button>
  )
}

type LogoutFormProps = {
  action: () => Promise<void>
}

export function LogoutForm({ action }: LogoutFormProps) {
  return (
    <form action={action}>
      <SubmitButton />
    </form>
  )
}

