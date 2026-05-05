"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { PlugoLogo } from "@/components/plugo-logo"
import { usePlugo } from "@/lib/plugo-context"

export default function SplashPage() {
  const router = useRouter()
  const { state } = usePlugo()

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
          <div className="absolute inset-0 rounded-full border border-primary/20 animate-plugo-pulse" />
          <div
            className="absolute inset-6 rounded-full border border-primary/30 animate-plugo-pulse"
            style={{ animationDelay: "0.4s" }}
          />
          <div
            className="absolute inset-14 rounded-full border border-primary/40 animate-plugo-pulse"
            style={{ animationDelay: "0.8s" }}
          />
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        <div className="animate-fade-in">
          <PlugoLogo size="xl" showWordmark={false} />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
          <h1 className="text-4xl font-semibold tracking-tight text-gradient-primary">PLUGO</h1>
          <p className="mt-3 max-w-[22ch] text-balance text-sm text-foreground-muted">
            Carga sin ansiedad. Viaja sin límites.
          </p>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <div className="flex gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-plugo-pulse" />
          <span
            className="h-1.5 w-1.5 rounded-full bg-primary animate-plugo-pulse"
            style={{ animationDelay: "0.2s" }}
          />
          <span
            className="h-1.5 w-1.5 rounded-full bg-primary animate-plugo-pulse"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
      </div>
    </main>
  )
}
