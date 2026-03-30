import type { Metadata } from "next"

import { SignupForm } from "@/components/auth/signup-form"

export const metadata: Metadata = {
  title: "Sign Up | Study Hub"
}

export default function SignupPage() {
  return <SignupForm />
}

