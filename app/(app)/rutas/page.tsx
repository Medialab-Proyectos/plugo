"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowRight,
  BatteryCharging,
  Clock,
  Gauge,
  MapPin,
  Mountain,
  Navigation,
  Route as RouteIcon,
  Sparkles,
  ThermometerSnowflake,
  TriangleAlert,
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
  estimatedMinutes,
  formatMinutes,
  googleMapsRouteUrl,
  chargerProbability,
  probabilityClasses,
  probabilityLevel,
} from "@/lib/decision"
import { estimateTrip, tripConditions, type TripEstimate } from "@/lib/autonomy"
import { cn } from "@/lib/utils"

type Plan = {
  origin: string
  destination: string
  distanceKm: number
  durationMin: number
  elevationM: number
  initialBattery: number | null
  arrivalBattery: number | null
  needsCharge: boolean
  recommendation: string
  chargersOnWay: number
  estimate: TripEstimate
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
      // Relieve: usamos la elevación neta real de la ruta conocida; si no, heurística suave.
      const elevationM = known?.elevation ?? Math.round((distanceKm % 7) * 30 - 200)

      const conditions = tripConditions(state.preferences)
      const estimate = estimateTrip(state.vehicle, state.battery, {
        distanceKm,
        terrain: { netM: elevationM },
        conditions,
      })

      const initial = state.battery
      const arrival = estimate.arrivalPct
      const needsCharge = !estimate.canArrive

      // Electrolineras útiles en el trayecto (operativas, dentro del rango)
      const chargersOnWay = chargers.filter(
        (c) => c.distanceKm <= distanceKm && c.status !== "fuera-de-servicio",
      ).length

      // Sugerimos 1 parada solo si no se llega con confianza
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
        recommendation = "Agrega tu nivel de batería para una estimación precisa."
      } else if (arrival < 15) {
        recommendation = "No llegas con confianza. Te sugerimos cargar antes de salir."
      } else if (arrival < 25) {
        recommendation = "Llegas justo. Te recomendamos cargar antes de regresar."
      } else if (arrival < 50) {
        recommendation = "Llegas con tranquilidad. Considera cargar antes de tu próximo viaje."
      } else {
        recommendation = "Tienes carga de sobra para este viaje."
      }

      return {
        origin: org,
        destination: dest,
        distanceKm,
        durationMin: estimatedMinutes(distanceKm),
        elevationM,
        initialBattery: initial,
        arrivalBattery: arrival,
        needsCharge,
        recommendation,
        chargersOnWay,
        estimate,
        stops,
      }
    },
    [state.battery, state.vehicle, state.preferences],
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
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">Autonomía real</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">¿Hasta dónde llegas?</h1>
        <p className="mt-1 text-xs text-foreground-muted">
          Calculamos tu autonomía según el relieve, el clima y tu forma de conducir — no solo la distancia.
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
              <p className="mt-2 text-sm font-semibold">Tu autonomía real, sin sorpresas</p>
              <p className="mt-1 text-xs text-foreground-muted">
                Escribe tu destino y calculamos cuánta batería gastas según el relieve, el clima y tu vehículo.
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
      <CopilotRoute plan={plan} />

      {/* Resumen de viaje (sin km de autonomía, foco en batería al llegar) */}
      <GlassCard variant="strong" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-foreground-soft">Resumen del viaje</p>
            <p className="mt-1 text-base font-semibold">{plan.destination}</p>
          </div>
          <StatusBadge tone={arrivalTone}>{plan.needsCharge ? "Requiere parada" : "Viaje directo"}</StatusBadge>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-overlay-1 p-3">
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

        <FactorBreakdown plan={plan} />

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
          message="No hay electrolineras confiables cerca de tu ruta. Te mostramos alternativas en el mapa."
          ctaLabel="Ver mapa"
          onCta={() => (window.location.href = "/mapa")}
        />
      ) : null}
    </div>
  )
}

function CopilotRoute({ plan }: { plan: Plan }) {
  const n = plan.chargersOnWay
  const dest = plan.destination

  let tone: "warn" | "ok" = "ok"
  let Icon = Sparkles
  let text: React.ReactNode

  if (plan.needsCharge && n === 0) {
    tone = "warn"
    Icon = TriangleAlert
    text = (
      <>
        No encuentro electrolineras confiables camino a <b className="font-semibold">{dest}</b>. Carga al 100% antes de
        salir o considera otro medio para no quedarte a mitad de camino.
      </>
    )
  } else if (plan.needsCharge && n > 0) {
    tone = "warn"
    Icon = TriangleAlert
    text = (
      <>
        Llegas justo. Hay <b className="font-semibold">{n} electrolineras</b> camino a {dest}; planifica una parada.
        Algunas pueden estar ocupadas, así que sal con margen.
      </>
    )
  } else {
    text = (
      <>
        Vas tranquilo{n > 0 ? <>: <b className="font-semibold">{n} electrolineras</b> en el camino a {dest} por si acaso</> : ""}. Si llegas
        de noche, descansa cerca de una antes del último tramo.
      </>
    )
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-3xl border p-4",
        tone === "warn" ? "border-warning/30 bg-warning/5" : "border-primary/25 bg-primary/5",
      )}
    >
      <div
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-2xl",
          tone === "warn" ? "bg-warning/15 text-warning" : "bg-primary/15 text-primary",
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-foreground-soft">Copiloto Plugo</p>
        <p className="mt-0.5 text-[13px] leading-snug text-foreground">{text}</p>
      </div>
    </div>
  )
}

function FactorBreakdown({ plan }: { plan: Plan }) {
  const f = plan.estimate.factors
  const rows = [
    {
      Icon: Mountain,
      label: plan.elevationM >= 0 ? `Relieve · sube ${plan.elevationM} m` : `Relieve · baja ${Math.abs(plan.elevationM)} m`,
      value: f.relieve,
    },
    { Icon: ThermometerSnowflake, label: "Clima (frío de la sabana)", value: f.clima },
    { Icon: Gauge, label: "Velocidad de carretera", value: f.velocidad },
  ].filter((r) => Math.abs(r.value) >= 1)

  if (rows.length === 0) return null

  return (
    <div className="space-y-2 rounded-2xl border border-border/60 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-foreground-soft">
        Por qué cambia tu autonomía
      </p>
      {rows.map(({ Icon, label, value }) => {
        const saves = value < 0
        return (
          <div key={label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-xs text-foreground-muted">
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {label}
            </span>
            <span className={cn("text-xs font-semibold tabular-nums", saves ? "text-success" : "text-warning")}>
              {saves ? "" : "+"}
              {value}% batería
            </span>
          </div>
        )
      })}
      <p className="pt-1 text-[10px] leading-relaxed text-foreground-soft">
        Subir consume más; bajar recupera energía con la regeneración.
      </p>
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
