"use client"

import * as React from "react"
import { BatteryCharging, ChevronRight } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { StatusBadge } from "@/components/status-badge"
import { BatteryModal } from "@/components/battery-modal"
import { useCumbreva, useBatteryStatus } from "@/lib/cumbreva-context"
import { cn } from "@/lib/utils"

export function VehicleCard({ compact = false }: { compact?: boolean }) {
  const { state } = useCumbreva()
  const status = useBatteryStatus()
  const [open, setOpen] = React.useState(false)

  if (!state.vehicle) return null

  const tone = status.level === "rojo" ? "danger" : status.level === "amarillo" ? "warning" : "success"

  return (
    <>
      <GlassCard variant="strong" className="overflow-hidden p-0">
        <div className="relative h-36 overflow-hidden bg-background-secondary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={state.vehicle.photo || "/vehicle-byd-seagull-side-dark.jpg"}
            alt={state.vehicle.name}
            className="absolute inset-0 h-full w-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background-secondary via-background-secondary/40 to-transparent" />
          <div className="absolute right-3 top-3">
            <StatusBadge tone={tone} withDot>
              {status.message}
            </StatusBadge>
          </div>
        </div>

        <div className="flex items-center justify-between p-4">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold">{state.vehicle.name}</p>
            <p className="mt-0.5 font-mono text-xs uppercase tracking-widest text-foreground-muted">
              {state.vehicle.plate} · {state.vehicle.brand} {state.vehicle.model}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-foreground-soft">Batería</p>
            <p
              className={cn(
                "text-sm font-semibold tabular-nums",
                state.battery === null ? "text-foreground-muted" : "text-foreground",
              )}
            >
              {state.battery === null ? "No registrada" : `${state.battery}%`}
            </p>
          </div>
        </div>

        {!compact && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex w-full items-center justify-between border-t border-border/60 px-4 py-3 text-left transition hover:bg-overlay-hover"
          >
            <div className="flex items-center gap-2">
              <BatteryCharging className="h-4 w-4 text-primary" aria-hidden />
              <span className="text-sm">Actualizar batería</span>
            </div>
            <ChevronRight className="h-4 w-4 text-foreground-muted" aria-hidden />
          </button>
        )}
      </GlassCard>

      <BatteryModal open={open} onOpenChange={setOpen} />
    </>
  )
}
