"use client"

import { useEffect, useMemo, useState } from "react"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const DEFAULT_SECONDS = 25 * 60

export default function FocusModePage() {
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_SECONDS)
  const [running, setRunning] = useState(false)
  const [topic, setTopic] = useState("")

  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => {
      setSecondsLeft((value) => (value > 0 ? value - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [running])

  useEffect(() => {
    if (secondsLeft === 0) setRunning(false)
  }, [secondsLeft])

  const display = useMemo(() => {
    const min = Math.floor(secondsLeft / 60)
    const sec = secondsLeft % 60
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
  }, [secondsLeft])

  return (
    <div className="mx-auto max-w-3xl space-y-6 card-reveal">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-white">Focus Mode</h1>
        <p className="mt-2 text-sm text-zinc-400">Distraction-free sprint for reading, solving, and revision.</p>
      </div>

      <Card className="border-white/10 bg-white/[0.03]">
        <CardHeader>
          <CardTitle className="text-white">Session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="What are you focusing on?"
            className="h-11 w-full rounded-md border border-white/10 bg-black/45 px-3 text-sm text-zinc-200 outline-none focus:ring-2 focus:ring-primary/60"
          />
          <p className="text-center text-6xl font-semibold text-white">{display}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button className="rounded-full bg-[#b784ff] text-black hover:bg-[#c697ff]" onClick={() => setRunning((v) => !v)}>
              {running ? "Pause" : "Start"}
            </Button>
            <Button
              variant="secondary"
              className="rounded-full bg-white/10 hover:bg-white/20"
              onClick={() => {
                setRunning(false)
                setSecondsLeft(DEFAULT_SECONDS)
              }}
            >
              Reset
            </Button>
            <Button variant="secondary" className="rounded-full bg-white/10 hover:bg-white/20" asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
          {topic ? <p className="text-center text-sm text-zinc-400">Current focus: {topic}</p> : null}
        </CardContent>
      </Card>
    </div>
  )
}

