"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowRight,
  BatteryCharging,
  Clock,
  MapPin,
  Navigation,
  Route as RouteIcon,
  Sparkles,
  Zap,
} from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TextField } from "@/components/ui/text-field"
import { StatusBadge } from "@/components/status-badge"
import { InlineAlert } from "@/components/inline-alert"
import { chargers, popularRoutes } from "@/lib/mock-data"
import { usePlugo } from "@/lib/plugo-context"
import {
  batteryUsedFor,
  estimatedMinutes,
  formatMinutes,
  googleMapsRouteUrl,
  chargerProbability,
  probabilityClasses,
  probabilityLevel,
} from "@/lib/decision"
import { cn } from "@/lib/utils"

type Plan = {
  origin: string
  destination: string
  distanceKm: number
  durationMin: number
  initialBattery: number | null
  arrivalBattery: number | null
  needsCharge: boolean
  recommendation: string
  stops: { id: string; name: string; address: string; distanceKm: number; durationMin: number }[]
}

export default function RutasPage() {
  const { state } = usePlugo()
  const [origin, setOrigin] = React.useState("Mi ubicación actual")
  const [destination, setDestination] = React.useState("")
  const [plan, setPlan] = React.useState<Plan | null>(null)
  const [activeTab, setActiveTab] = React.useState<"planificar" | "frecuentes">("planificar")

  const computePlan = React.useCallback(
    (org: string, dest: string): Plan | null => {
      if (!dest.trim()) return null
      // Buscamos una ruta popular conocida con ese destino, si no, usamos heurística
      const known = popularRoutes.find((r) => dest.toLowerCase().includes(r.to.toLowerCase()))
      const distanceKm = known?.distance ?? Math.max(20, Math.round(50 + Math.random() * 200))
      const durationMin = known
        ? parseInt(known.time) * 60 + (known.time.includes("m") ? parseInt(known.time.split("h")[1] || "0") : 0)
        : estimatedMinutes(distanceKm)

      const usedPct = batteryUsedFor(distanceKm, state.vehicle)
      const initial = state.battery
      const arrival = initial !== null ? Math.max(0, initial - usedPct) : null

      const needsCharge = arrival !== null ? arrival < 25 : usedPct > 70

      // Sugerimos 1 parada solo si la batería en destino baja de 25%
      const onTheWay = chargers.filter((c) => c.distanceKm < distanceKm).slice(0, 1)
      const stops = needsCharge
        ? onTheWay.map((c) => ({
            id: c.id,
            name: c.name,
            address: c.address,
            distanceKm: c.distanceKm,
            durationMin: 25,
          }))
        : []

      let recommendation: string
      if (arrival === null) {
        recommendation = "Te recomendamos cargar antes de salir si no conoces tu nivel de batería."
      } else if (arrival < 15) {
        recommendation = "No llegas con confianza. Te sugerimos cargar antes de salir."
      } else if (arrival < 25) {
        recommendation = "Te recomendamos cargar antes de regresar."
      } else if (arrival < 50) {
        recommendation = "Llegas con tranquilidad. Considera cargar antes de tu próximo viaje."
      } else {
        recommendation = "Tienes carga de sobra para este viaje."
      }

      return {
        origin: org,
        destination: dest,
        distanceKm,
        durationMin: known
          ? estimatedMinutes(distanceKm) // mantenemos consistencia
          : estimatedMinutes(distanceKm),
        initialBattery: initial,
        arrivalBattery: arrival,
        needsCharge,
        recommendation,
        stops,
      }
    },
    [state.battery, state.vehicle],
  )

  // Auto cálculo cuando hay destino
  React.useEffect(() => {
    if (!destination.trim()) {
      setPlan(null)
      return
    }
    const id = setTimeout(() => {
      setPlan(computePlan(origin, destination))
    }, 300)
    return () => clearTimeout(id)
  }, [destination, origin, computePlan])

  return (
    <div className="space-y-5 px-5 pb-6 pt-5">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">Planificador</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Te ayudamos a llegar</h1>
        <p className="mt-1 text-xs text-foreground-muted">
          Calcula tu viaje con paradas óptimas y sin sorpresas en el camino.
        </p>
      </header>

      {/* M3-style segmented control — pill behind active option */}
      <div
        role="tablist"
        aria-label="Modo de planificador"
        className="relative grid grid-cols-2 gap-1 rounded-full bg-[var(--input)] p-1 ring-1 ring-inset ring-[var(--input-border)]"
      >
        {(["planificar", "frecuentes"] as const).map((t) => {
          const active = activeTab === t
          return (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(t)}
              className={cn(
                "relative z-10 rounded-full py-2 text-sm font-medium transition-colors duration-200",
                active ? "text-primary-foreground" : "text-foreground-muted hover:text-foreground",
              )}
            >
              {active && (
                <span
                  aria-hidden
                  className="absolute inset-0 -z-10 rounded-full bg-primary shadow-[0_4px_16px_-6px_rgba(0,241,199,0.5)]"
                />
              )}
              {t === "planificar" ? "Planificar" : "Frecuentes"}
            </button>
          )
        })}
      </div>

      {activeTab === "planificar" && (
        <div className="space-y-4">
          <GlassCard className="space-y-4">
            <TextField
              id="origin"
              label="Origen"
              leadingIcon={<MapPin className="text-primary" />}
            >
              <Input
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
              />
            </TextField>

            <TextField
              id="destination"
              label="Destino"
              helper={!destination ? "La ruta se calcula automáticamente al escribir." : undefined}
              leadingIcon={<Navigation className="text-primary" />}
            >
              <Input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Ej. Melgar, Tolima"
              />
            </TextField>

            {/* Suggestion chips — clearly different shape (pill) and emphasis from inputs above */}
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar">
              <span className="shrink-0 self-center pr-1 text-overline text-foreground-soft">Sugerencias</span>
              {popularRoutes.slice(0, 5).map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setDestination(r.to)}
                  className="shrink-0 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20 transition hover:bg-primary/15 active:scale-95"
                >
                  {r.to}
                </button>
              ))}
            </div>
          </GlassCard>

          {plan && <PlanResult plan={plan} />}

          {plan === null && destination.trim() === "" && (
            <GlassCard className="text-center">
              <Sparkles className="mx-auto h-6 w-6 text-primary" />
              <p className="mt-2 text-sm font-semibold">Encuentra dónde cargar sin riesgo</p>
              <p className="mt-1 text-xs text-foreground-muted">
                Escribe tu destino y calculamos la mejor ruta según tu vehículo y batería.
              </p>
            </GlassCard>
          )}
        </div>
      )}

      {activeTab === "frecuentes" && (
        <div className="space-y-3">
          {popularRoutes.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                setDestination(r.to)
                setActiveTab("planificar")
              }}
              className="block w-full rounded-3xl border border-border bg-card p-4 text-left transition hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {r.from} → {r.to}
                  </p>
                  <p className="mt-1 text-[11px] text-foreground-muted">{r.distance} km · {r.time}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-foreground-muted" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function PlanResult({ plan }: { plan: Plan }) {
  const arrivalTone =
    plan.arrivalBattery === null
      ? "muted"
      : plan.arrivalBattery >= 50
        ? "success"
        : plan.arrivalBattery >= 25
          ? "warning"
          : "danger"

  const arrivalText =
    plan.arrivalBattery !== null
      ? `Llegarías con ${plan.arrivalBattery}% de batería`
      : "Agrega tu batería para estimar la llegada"

  return (
    <div className="space-y-3">
      {/* Resumen de viaje (sin km de autonomía, foco en batería al llegar) */}
      <GlassCard variant="strong" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-foreground-soft">Resumen del viaje</p>
            <p className="mt-1 text-base font-semibold">{plan.destination}</p>
          </div>
          <StatusBadge tone={arrivalTone}>{plan.needsCharge ? "Requiere parada" : "Viaje directo"}</StatusBadge>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-white/[0.04] p-3">
          <Metric Icon={RouteIcon} label="Distancia" value={`${plan.distanceKm} km`} />
          <Metric Icon={Clock} label="Duración" value={formatMinutes(plan.durationMin)} />
          <Metric
            Icon={BatteryCharging}
            label="Llegas con"
            value={plan.arrivalBattery !== null ? `${plan.arrivalBattery}%` : "—"}
            tone={arrivalTone}
          />
        </div>

        <p className="rounded-2xl bg-primary/10 px-3 py-2 text-xs text-primary">{arrivalText}. {plan.recommendation}</p>

        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Button asChild size="lg" className="w-full">
            <a
              href={googleMapsRouteUrl(plan.destination, plan.origin)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Navigation className="h-4 w-4" />
              Iniciar navegación
            </a>
          </Button>
          <Button variant="outline" size="lg">
            Guardar
          </Button>
        </div>
      </GlassCard>

      {/* Paradas recomendadas */}
      {plan.stops.length > 0 ? (
        <div className="space-y-2">
          <p className="px-1 text-[10px] font-semibold uppercase tracking-widest text-foreground-soft">
            Parada recomendada en el camino
          </p>
          {plan.stops.map((s, i) => {
            const charger = chargers.find((c) => c.id === s.id)
            if (!charger) return null
            const prob = chargerProbability(charger)
            const cls = probabilityClasses[probabilityLevel(prob)]
            return (
              <Link
                key={s.id}
                href={`/cargador/${s.id}`}
                className="flex items-center gap-3 rounded-3xl border border-border bg-card p-3 transition hover:border-primary/40"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Zap className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{s.name}</p>
                  <p className="truncate text-[11px] text-foreground-muted">
                    {charger.power} kW · {charger.connectors.join(" · ")}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1",
                    cls.bg,
                    cls.text,
                    cls.ring,
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", cls.dot)} />
                  {prob}%
                </span>
              </Link>
            )
          })}
        </div>
      ) : plan.needsCharge ? (
        <InlineAlert
          kind="info"
          title="No encontramos paradas óptimas"
          message="No hay cargadores confiables cerca de tu ruta. Te mostramos alternativas en el mapa."
          ctaLabel="Ver mapa"
          onCta={() => (window.location.href = "/mapa")}
        />
      ) : null}
    </div>
  )
}

function Metric({
  Icon,
  label,
  value,
  tone,
}: {
  Icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  tone?: "success" | "warning" | "danger" | "muted"
}) {
  return (
    <div>
      <Icon className="h-3.5 w-3.5 text-foreground-soft" />
      <p className="mt-1 text-[10px] uppercase tracking-widest text-foreground-soft">{label}</p>
      <p
        className={cn(
          "mt-0.5 text-sm font-semibold tabular-nums",
          tone === "success" && "text-success",
          tone === "warning" && "text-warning",
          tone === "danger" && "text-destructive",
        )}
      >
        {value}
      </p>
    </div>
  )
}
