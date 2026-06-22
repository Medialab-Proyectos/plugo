"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useCumbreva } from "@/lib/cumbreva-context"

export default function SplashPage() {
  const router = useRouter()
  const { state } = useCumbreva()

  React.useEffect(() => {
    const t = setTimeout(() => {
      if (state.hasSession && state.vehicle) {
        router.replace("/inicio")
      } else if (state.hasSession) {
        router.replace("/vehiculo/nuevo")
      } else {
        router.replace("/onboarding")
      }
    }, 2000)
    return () => clearTimeout(t)
  }, [router, state.hasSession, state.vehicle])

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden">
      {/* energy gradient backdrop */}
      <div aria-hidden className="absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/25 blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-success/15 blur-[140px]" />
        <div className="absolute inset-0 grid-pattern opacity-30" />
      </div>

      {/* energy ring */}
      <div aria-hidden className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative h-72 w-72">
          <div className="absolute inset-0 rounded-full border border-primary/20 animate-cumbreva-pulse" />
          <div
            className="absolute inset-6 rounded-full border border-primary/30 animate-cumbreva-pulse"
            style={{ animationDelay: "0.4s" }}
          />
          <div
            className="absolute inset-14 rounded-full border border-primary/40 animate-cumbreva-pulse"
            style={{ animationDelay: "0.8s" }}
          />
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-7 px-6 text-center">
        {/* Isologo brillante */}
        <div
          className="animate-fade-in relative flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-primary to-success glow-primary shadow-[0_0_70px_-2px_var(--primary)]"
        >
          <svg width={52} height={52} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"
              fill="#00150F"
              stroke="#00150F"
              strokeWidth="0.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Wordmark imponente + eslogan */}
        <div className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
          <h1 className="text-gradient-primary text-[3.25rem] font-black leading-none tracking-tight">CUMBREVA</h1>
          <p className="mt-4 text-base font-bold text-foreground">Inicia tu copiloto eléctrico</p>
          <p className="mx-auto mt-1.5 max-w-[26ch] text-balance text-sm text-foreground-muted">
            Carga sin ansiedad. Viaja sin límites.
          </p>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <div className="flex gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-cumbreva-pulse" />
          <span
            className="h-1.5 w-1.5 rounded-full bg-primary animate-cumbreva-pulse"
            style={{ animationDelay: "0.2s" }}
          />
          <span
            className="h-1.5 w-1.5 rounded-full bg-primary animate-cumbreva-pulse"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
      </div>
    </main>
  )
}
