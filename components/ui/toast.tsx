"use client"

import type { ReactNode } from "react"
import { createContext, useCallback, useContext, useMemo, useState } from "react"

import { CheckCircle2, CircleAlert, X } from "lucide-react"

type ToastVariant = "success" | "error" | "info"

type ToastItem = {
  id: string
  title: string
  description?: string
  variant: ToastVariant
}

type ToastInput = {
  title: string
  description?: string
  variant?: ToastVariant
}

type ToastContextValue = {
  toast: (input: ToastInput) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const remove = useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id))
  }, [])

  const toast = useCallback(
    ({ title, description, variant = "info" }: ToastInput) => {
      const id = crypto.randomUUID()
      setToasts((current) => [...current, { id, title, description, variant }])
      setTimeout(() => remove(id), 4200)
    },
    [remove]
  )

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[70] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((item) => (
          <div
            key={item.id}
            className="pointer-events-auto rounded-xl border border-white/10 bg-[#111827f2] p-3 shadow-lg backdrop-blur transition-all duration-200"
          >
            <div className="flex items-start gap-2">
              {item.variant === "success" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
              ) : item.variant === "error" ? (
                <CircleAlert className="mt-0.5 h-4 w-4 text-red-300" />
              ) : (
                <CircleAlert className="mt-0.5 h-4 w-4 text-primary" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">{item.title}</p>
                {item.description ? <p className="mt-0.5 text-xs text-zinc-400">{item.description}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => remove(item.id)}
                className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-200"
                aria-label="Dismiss toast"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error("useToast must be used inside ToastProvider.")
  return context
}

