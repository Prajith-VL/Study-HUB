"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

import { X } from "lucide-react"

import { cn } from "@/lib/utils"

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function Modal({ open, onClose, title, description, children, className }: ModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (!open || !mounted) return

    const { body } = document
    const previousOverflow = body.style.overflow
    body.style.overflow = "hidden"

    return () => {
      body.style.overflow = previousOverflow
    }
  }, [mounted, open])

  if (!open) return null
  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close modal"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#10131cf2] p-4 shadow-2xl sm:max-h-[90vh] sm:p-5",
          className
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            {description ? <p className="mt-1 text-sm text-zinc-400">{description}</p> : null}
          </div>
          <button
            type="button"
            className="rounded-md border border-white/10 p-1.5 text-zinc-400 transition-colors hover:border-white/20 hover:text-zinc-200"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  )
}
