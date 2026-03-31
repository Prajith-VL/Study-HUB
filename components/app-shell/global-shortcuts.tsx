"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

const SHORTCUTS: Record<string, "/dashboard" | "/subjects" | "/notes" | "/planner" | "/analytics"> = {
  d: "/dashboard",
  s: "/subjects",
  n: "/notes",
  p: "/planner",
  a: "/analytics"
}

export function GlobalShortcuts() {
  const router = useRouter()

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
      const key = event.key.toLowerCase()
      const route = SHORTCUTS[key]
      if (!route) return
      const target = event.target as HTMLElement | null
      const isTypingElement =
        target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.getAttribute("contenteditable") === "true"
      if (isTypingElement) return
      event.preventDefault()
      router.push(route)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [router])

  return null
}

