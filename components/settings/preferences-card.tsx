"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast"

export function PreferencesCard() {
  const { theme, setTheme } = useTheme()
  const [defaultRevisionRound, setDefaultRevisionRound] = useState("1")
  const { toast } = useToast()

  useEffect(() => {
    const saved = localStorage.getItem("studyhub_default_revision_round")
    if (saved) {
      setDefaultRevisionRound(saved)
    }
  }, [])

  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardHeader>
        <CardTitle className="text-white">App Preferences</CardTitle>
        <CardDescription>Client-side workspace defaults for day-to-day planning speed.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Theme</Label>
          <div className="flex flex-wrap gap-2">
            <Button variant={theme === "dark" ? "default" : "secondary"} className="bg-white/10 hover:bg-white/20" onClick={() => setTheme("dark")}>
              Dark
            </Button>
            <Button variant={theme === "light" ? "default" : "secondary"} className="bg-white/10 hover:bg-white/20" onClick={() => setTheme("light")}>
              Light
            </Button>
            <Button variant={theme === "system" ? "default" : "secondary"} className="bg-white/10 hover:bg-white/20" onClick={() => setTheme("system")}>
              System
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="defaultRound">Default Revision Round</Label>
          <Input
            id="defaultRound"
            type="number"
            min={1}
            value={defaultRevisionRound}
            onChange={(event) => setDefaultRevisionRound(event.target.value)}
          />
        </div>

        <Button
          className="rounded-full bg-[#b784ff] text-black hover:bg-[#c697ff]"
          onClick={() => {
            localStorage.setItem("studyhub_default_revision_round", defaultRevisionRound)
            toast({ title: "Preferences saved", variant: "success" })
          }}
        >
          Save Preferences
        </Button>
      </CardContent>
    </Card>
  )
}
