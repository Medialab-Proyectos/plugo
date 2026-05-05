"use client"

import Link from "next/link"
import { Star, Zap, MapPin, Clock } from "lucide-react"
import type { Charger } from "@/lib/mock-data"
import { formatCOP } from "@/lib/mock-data"
import { StatusBadge } from "./status-badge"
import { Button } from "./ui/button"

const statusMap = {
  disponible: { label: "Disponible", tone: "success" as const },
  ocupado: { label: "Ocupado", tone: "warning" as const },
  "fuera-de-servicio": { label: "Fuera de servicio", tone: "danger" as const },
}

export function ChargerCard({ charger, compact = false }: { charger: Charger; compact?: boolean }) {
  const status = statusMap[charger.status]
  const isAvailable = charger.status === "disponible"

  return (
    <article className="glass overflow-hidden rounded-3xl">
      <div className="flex gap-3 p-3">
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-background-secondary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={charger.photo || "/placeholder.svg"}
            alt={charger.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute left-1.5 top-1.5">
            <StatusBadge tone={status.tone} withDot>
              {status.label}
            </StatusBadge>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold">{charger.name}</h3>
              <div className="mt-0.5 flex items-center gap-1 text-[11px] text-foreground-muted">
                <MapPin className="h-3 w-3" aria-hidden />
                <span className="truncate">
                  {charger.distanceKm < 10
                    ? `${charger.distanceKm.toFixed(1)} km`
                    : `${Math.round(charger.distanceKm)} km`}{" "}
                  · {charger.city}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-0.5 text-xs">
              <Star className="h-3.5 w-3.5 fill-warning text-warning" aria-hidden />
              <span className="font-medium">{charger.rating}</span>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              <Zap className="h-3 w-3" aria-hidden />
              {charger.power} kW
            </span>
            <span className="inline-flex items-center rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-foreground-muted">
              {charger.connectors.join(" · ")}
            </span>
            {charger.type === "privado" && (
              <span className="inline-flex items-center rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-medium text-blue-300">
                Anfitrión
              </span>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="text-xs">
              <span className="font-semibold text-foreground">{formatCOP(charger.pricePerKwh)}</span>
              <span className="text-foreground-muted"> / kWh</span>
            </div>
            {charger.estimatedWaitMin > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] text-warning">
                <Clock className="h-3 w-3" aria-hidden /> ~{charger.estimatedWaitMin} min
              </span>
            )}
          </div>
        </div>
      </div>

      {!compact && (
        <div className="grid grid-cols-2 gap-2 border-t border-border/60 p-3">
          <Button asChild variant="ghost" className="h-10 rounded-2xl text-foreground hover:bg-white/5">
            <Link href={`/cargador/${charger.id}`}>Ver detalle</Link>
          </Button>
          <Button
            asChild
            disabled={!isAvailable}
            className="h-10 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-white/5 disabled:text-foreground-soft"
          >
            <Link href={isAvailable ? `/reserva/${charger.id}` : "#"}>
              {isAvailable ? "Reservar" : "No disponible"}
            </Link>
          </Button>
        </div>
      )}
    </article>
  )
}
