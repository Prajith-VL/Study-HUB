"use server"

import { revalidatePath } from "next/cache"

import type { ActionResult } from "@/lib/action-types"
import { createClient } from "@/lib/supabase/server"

function normalizeText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim()
}

export async function updateProfile(formData: FormData): Promise<ActionResult<{ fullName: string }>> {
  const fullName = normalizeText(formData.get("fullName"))
  if (fullName.length < 2) return { success: false, error: "Full name must be at least 2 characters." }

  const supabase = await createClient()
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()
  if (userError || !user) return { success: false, error: "Unauthorized." }

  const { error } = await supabase.auth.updateUser({
    data: {
      full_name: fullName
    }
  })

  if (error) return { success: false, error: error.message }
  revalidatePath("/settings")
  return { success: true, data: { fullName }, message: "Profile updated." }
}

