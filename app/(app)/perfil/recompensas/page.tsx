"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Award, Coffee, Gift, Sparkles, TrendingUp, Wrench, Zap } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { usePlugo } from "@/lib/plugo-context"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const rewards = [
  { Icon: Zap, name: "Carga gratis", points: 1500, description: "1 sesión hasta 30 kWh", featured: true },
  { Icon: Coffee, name: "Café Juan Valdez", points: 400, description: "Bebida en cualquier estación" },
  { Icon: Wrench, name: "Lavado premium", points: 800, description: "Detallado completo BlueWash" },
  { Icon: Gift, name: "Membresía PLUGO+", points: 3000, description: "1 mes gratis de beneficios" },
]

const milestones = [
  { label: "Bronce", points: 0 },
  { label: "Plata", points: 1000 },
  { label: "Oro", points: 1500 },
  { label: "Platino", points: 3500 },
]

const history = [
  { date: "12 abr", description: "Carga en Terpel Calle 100", points: 45, type: "earn" as const },
  { date: "08 abr", description: "Reseña verificada", points: 100, type: "earn" as const },
  { date: "02 abr", description: "Canjeado: Café Juan Valdez", points: 400, type: "spend" as const },
  { date: "28 mar", description: "Carga rápida en Cosmocentro", points: 60, type: "earn" as const },
]

export default function RecompensasPage() {
  const router = useRouter()
  const { state } = usePlugo()
  const points = state.plugoCoins
  const next = milestones.find((m) => m.points > points) ?? milestones[milestones.length - 1]
  const current = [...milestones].reverse().find((m) => m.points <= points) ?? milestones[0]
  const progress = next ? Math.min(100, Math.round((points / next.points) * 100)) : 100

  return (
    <div className="space-y-5 px-5 pb-6 pt-5">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-foreground-muted transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </button>

      <header>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">PLUGO Rewards</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Recompensas</h1>
        <p className="mt-1 text-xs text-foreground-muted">
          Cada carga, kilómetro y reseña suma. Canjea PlugoCoins por experiencias.
        </p>
      </header>

      <GlassCard variant="strong" className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/15 via-card to-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-foreground-soft">Tus puntos</p>
            <p className="mt-1 text-4xl font-semibold tabular-nums text-gradient-primary">
              {points.toLocaleString("es-CO")}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold">Nivel {current.label}</span>
            <span className="text-foreground-muted">
              {Math.max(0, next.points - points)} pts para {next.label}
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-overlay-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-success transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 flex justify-between text-[10px] uppercase tracking-wider text-foreground-soft">
            {milestones.map((m) => (
              <span key={m.label} className={m.label === current.label ? "text-primary" : ""}>
                {m.label}
              </span>
            ))}
          </div>
        </div>
      </GlassCard>

      <div>
        <p className="px-1 text-[10px] font-semibold uppercase tracking-widest text-foreground-soft">Canjea</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {rewards.map((r) => {
            const canRedeem = points >= r.points
            return (
              <button
                key={r.name}
                type="button"
                disabled={!canRedeem}
                onClick={() => toast.success("Canje en proceso", { description: `${r.name} se acreditará en tu cuenta.` })}
                className={cn(
                  "group rounded-3xl border border-border bg-card p-4 text-left transition hover:border-primary/40",
                  !canRedeem && "opacity-50",
                )}
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <r.Icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold">{r.name}</p>
                <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-foreground-muted">
                  {r.description}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                  <span className="text-xs font-semibold tabular-nums text-primary">
                    {r.points.toLocaleString("es-CO")} pts
                  </span>
                  {r.featured && <Award className="h-3.5 w-3.5 text-warning" />}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p className="px-1 text-[10px] font-semibold uppercase tracking-widest text-foreground-soft">
          Movimientos recientes
        </p>
        <div className="mt-3 overflow-hidden rounded-3xl border border-border bg-card">
          {history.map((h, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3 px-4 py-3",
                i !== history.length - 1 && "border-b border-border/60",
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  h.type === "earn" ? "bg-success/10 text-success" : "bg-overlay-1 text-foreground-muted",
                )}
              >
                <TrendingUp className={cn("h-4 w-4", h.type === "spend" && "rotate-180")} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{h.description}</p>
                <p className="text-[11px] text-foreground-muted">{h.date}</p>
              </div>
              <span
                className={cn(
                  "text-sm font-semibold tabular-nums",
                  h.type === "earn" ? "text-success" : "text-foreground-muted",
                )}
              >
                {h.type === "earn" ? "+" : "−"}
                {h.points}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
