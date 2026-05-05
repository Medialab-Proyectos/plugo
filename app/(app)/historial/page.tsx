"use client"

import * as React from "react"
import { Calendar, ChevronRight, Filter, Zap, Star } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { chargingHistory, formatCOP } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export default function HistorialPage() {
  const [period, setPeriod] = React.useState<"semana" | "mes" | "anio">("mes")

  const totals = {
    sessions: chargingHistory.length,
    energy: chargingHistory.reduce((s, x) => s + x.kwh, 0),
    cost: chargingHistory.reduce((s, x) => s + x.cost, 0),
    co2: chargingHistory.reduce((s, x) => s + x.kwh * 0.45, 0),
  }

  return (
    <div className="space-y-5 px-5 pb-6 pt-5">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">Tu actividad</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Historial de carga</h1>
        <p className="mt-1 text-xs text-foreground-muted">Cada sesión, cada kilómetro, cada peso ahorrado.</p>
      </header>

      <div className="flex gap-2">
        {(["semana", "mes", "anio"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={cn(
              "flex-1 rounded-full border px-3 py-2 text-xs font-medium transition",
              period === p
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-foreground-muted",
            )}
          >
            {p === "semana" ? "Semana" : p === "mes" ? "Mes" : "Año"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <GlassCard>
          <p className="text-[10px] uppercase tracking-widest text-foreground-soft">Sesiones</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{totals.sessions}</p>
        </GlassCard>
        <GlassCard>
          <p className="text-[10px] uppercase tracking-widest text-foreground-soft">Energía</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {totals.energy.toFixed(1)}
            <span className="ml-1 text-sm text-foreground-muted">kWh</span>
          </p>
        </GlassCard>
        <GlassCard>
          <p className="text-[10px] uppercase tracking-widest text-foreground-soft">Total gastado</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{formatCOP(totals.cost)}</p>
        </GlassCard>
        <GlassCard className="ring-1 ring-success/30">
          <p className="text-[10px] uppercase tracking-widest text-success">CO₂ evitado</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {totals.co2.toFixed(0)}
            <span className="ml-1 text-sm text-foreground-muted">kg</span>
          </p>
        </GlassCard>
      </div>

      <Tabs defaultValue="cargas" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-card">
          <TabsTrigger value="cargas">Cargas</TabsTrigger>
          <TabsTrigger value="servicios">Servicios</TabsTrigger>
        </TabsList>

        <TabsContent value="cargas" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-foreground-soft">
              Últimas sesiones
            </p>
            <button type="button" className="flex items-center gap-1 text-xs text-foreground-muted">
              <Filter className="h-3 w-3" />
              Filtrar
            </button>
          </div>
          {chargingHistory.map((s) => (
            <SessionRow key={s.id} session={s} />
          ))}
        </TabsContent>

        <TabsContent value="servicios" className="mt-4">
          <GlassCard className="text-center">
            <Calendar className="mx-auto h-10 w-10 text-foreground-muted" />
            <p className="mt-3 text-sm font-semibold">Sin servicios registrados</p>
            <p className="mt-1 text-xs text-foreground-muted">Cuando reserves un servicio aparecerá aquí.</p>
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SessionRow({ session }: { session: (typeof chargingHistory)[number] }) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-3xl border border-border bg-card p-4 text-left transition hover:border-primary/40"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Zap className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{session.location}</p>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-foreground-muted">
          <Calendar className="h-3 w-3" />
          {session.date}
          <span>·</span>
          <span>{session.kwh.toFixed(1)} kWh</span>
          <span>·</span>
          <Star className="h-3 w-3 fill-warning text-warning" />
          <span>{session.rating}</span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold tabular-nums">{formatCOP(session.cost)}</p>
        <p className="mt-0.5 text-[10px] text-success">−{(session.kwh * 0.45).toFixed(1)} kg CO₂</p>
      </div>
      <ChevronRight className="h-4 w-4 text-foreground-muted" />
    </button>
  )
}
