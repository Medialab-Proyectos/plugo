"use client"

import * as React from "react"
import Link from "next/link"
import { Search, SlidersHorizontal, X, MapPin, Navigation, Plug, Zap, Percent, BatteryWarning, ChevronRight } from "lucide-react"
import { ChargerMap } from "@/components/charger-map"
import { ChargerCard } from "@/components/charger-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { chargers, formatCOP, type Charger } from "@/lib/mock-data"
import { usePlugo } from "@/lib/plugo-context"
import {
  chargerProbability,
  probabilityClasses,
  probabilityLevel,
  probabilityLabel,
  estimatedMinutes,
  compatibility,
  rankChargers,
} from "@/lib/decision"
import { cn } from "@/lib/utils"

const filters = [
  { id: "disponibles", label: "Disponibles" },
  { id: "rapida", label: "Carga rápida" },
  { id: "publicos", label: "Públicos" },
  { id: "privados", label: "Privados" },
  { id: "compatibles", label: "Mi conector" },
  { id: "adaptadores", label: "Mis adaptadores" },
  { id: "barato", label: "Mejor precio" },
  { id: "calificado", label: "Mejor calificación" },
]

type SheetState = "collapsed" | "mid" | "expanded"

export default function MapaPage() {
  const { state } = usePlugo()
  const [search, setSearch] = React.useState("")
  const [activeFilters, setActiveFilters] = React.useState<string[]>(["disponibles"])
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [sheet, setSheet] = React.useState<SheetState>("mid")

  const filtered = React.useMemo(() => {
    let result = [...chargers]
    if (activeFilters.includes("disponibles")) result = result.filter((c) => c.status === "disponible")
    if (activeFilters.includes("rapida")) result = result.filter((c) => c.power >= 50)
    if (activeFilters.includes("publicos")) result = result.filter((c) => c.type === "publico")
    if (activeFilters.includes("privados")) result = result.filter((c) => c.type === "privado")
    if (activeFilters.includes("compatibles") && state.vehicle) {
      result = result.filter((c) => {
        const compat = compatibility(c, state.vehicle)
        return compat.compatible && !compat.viaAdapter
      })
    }
    if (activeFilters.includes("adaptadores") && state.vehicle) {
      result = result.filter((c) => {
        const compat = compatibility(c, state.vehicle)
        return compat.compatible && compat.viaAdapter
      })
    }
    if (activeFilters.includes("barato")) result = result.sort((a, b) => a.pricePerKwh - b.pricePerKwh)
    if (activeFilters.includes("calificado")) result = result.sort((a, b) => b.rating - a.rating)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q),
      )
    }
    return result
  }, [activeFilters, search, state.vehicle])

  // Auto-rank: si hay vehículo, ordena por score
  const ranked = React.useMemo(() => {
    if (!state.vehicle) return filtered
    const { primary, fallback, rest } = rankChargers(filtered, state.vehicle)
    const ordered: Charger[] = []
    if (primary) ordered.push(primary)
    if (fallback) ordered.push(fallback)
    ordered.push(...rest)
    // Append items filtered out by score (incompatibles) at the end
    filtered.forEach((c) => {
      if (!ordered.find((o) => o.id === c.id)) ordered.push(c)
    })
    return ordered
  }, [filtered, state.vehicle])

  const sheetHeight = { collapsed: "h-[120px]", mid: "h-[55%]", expanded: "h-[85%]" }[sheet]
  const selectedCharger = ranked.find((c) => c.id === selectedId) || null

  return (
    <div className="relative -mx-0 -mb-24 h-[calc(100dvh-0px)] overflow-hidden">
      {/* Map full screen */}
      <div className="absolute inset-0">
        <ChargerMap chargers={ranked} selectedId={selectedId} onSelect={setSelectedId} />
      </div>

      {/* Top: search + filters */}
      <div className="absolute left-0 right-0 top-0 z-20 safe-pt px-4 pt-4">
        {/* Barra de descuentos en electrolineras aliadas */}
        <Link
          href="/servicios"
          className="mb-3 flex items-center gap-2 rounded-full bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-[0_8px_24px_-12px_rgba(0,216,111,0.6)] active:scale-[0.98]"
        >
          <Percent className="h-4 w-4 shrink-0" />
          <span className="flex-1">Hasta 45% de descuento en electrolineras aliadas</span>
          <ChevronRight className="h-4 w-4 shrink-0" />
        </Link>

        {/* Search composite — recessed input surface inside glass wrapper for elevation */}
        <div className="surface-input flex items-center gap-2 rounded-2xl pl-4 pr-2 py-2 backdrop-blur-xl">
          <Search className="h-5 w-5 shrink-0 text-foreground-muted" aria-hidden />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar electrolinera, dirección…"
            aria-label="Buscar"
            className="h-10 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:border-0"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Limpiar búsqueda"
              className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-muted hover:bg-overlay-hover active:scale-95 transition"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {/* Filter chips — pill shape, distinct from input above */}
        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar">
          <button
            type="button"
            className="glass-strong flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium active:scale-95 transition"
            aria-label="Más filtros"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filtros
          </button>
          {filters.map((f) => {
            const active = activeFilters.includes(f.id)
            return (
              <button
                key={f.id}
                type="button"
                onClick={() =>
                  setActiveFilters(active ? activeFilters.filter((x) => x !== f.id) : [...activeFilters, f.id])
                }
                className={cn(
                  "h-9 shrink-0 rounded-full px-3.5 text-xs font-medium transition active:scale-95",
                  active
                    ? "bg-primary text-primary-foreground shadow-[0_4px_12px_-4px_rgba(0,241,199,0.5)]"
                    : "bg-[var(--surface-2)] text-foreground ring-1 ring-inset ring-[var(--card-border)] backdrop-blur-md hover:bg-overlay-hover",
                )}
                aria-pressed={active}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Bottom sheet (always visible) */}
      <DraggableSheet sheet={sheet} setSheet={setSheet} className={sheetHeight}>
        {(state.battery === null || state.battery <= 30) && (
          <Link
            href="/mi-vehiculo"
            className="mx-4 mb-2 flex items-center gap-2 rounded-2xl border border-warning/30 bg-warning/10 px-3 py-2 active:scale-[0.99]"
          >
            <BatteryWarning className="h-4 w-4 shrink-0 text-warning" />
            <span className="flex-1 text-xs text-foreground">
              {state.battery === null
                ? "¿Cuánta batería tienes? Actualízala para ver tu alcance real."
                : `Batería al ${state.battery}%. Te conviene cargar pronto.`}
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-warning" />
          </Link>
        )}

        <div className="flex items-center justify-between px-5 pb-3">
          <div>
            <p className="text-sm font-semibold">{ranked.length} electrolineras cerca</p>
            <p className="text-xs text-foreground-muted">
              {state.vehicle ? "Ordenadas por confiabilidad" : "Ordenadas por relevancia"}
            </p>
          </div>
        </div>

        {selectedCharger && sheet !== "collapsed" && (
          <div className="px-4 pb-4 animate-slide-up">
            <SelectedChargerCard charger={selectedCharger} />
          </div>
        )}

        {!selectedCharger && sheet !== "collapsed" && (
          <div className="space-y-3 overflow-y-auto px-4 pb-32 no-scrollbar h-[calc(100%-90px)]">
            {ranked.length === 0 ? (
              <p className="rounded-3xl border border-border bg-card p-6 text-center text-sm text-foreground-muted">
                No encontramos electrolineras cerca. Puedes ampliar el rango de búsqueda.
              </p>
            ) : (
              ranked.slice(0, sheet === "expanded" ? ranked.length : 4).map((c) => (
                <ChargerCard key={c.id} charger={c} compact={sheet === "mid"} />
              ))
            )}
          </div>
        )}
      </DraggableSheet>
    </div>
  )
}

/** Bottom sheet con drag por el handle */
function DraggableSheet({
  sheet,
  setSheet,
  className,
  children,
}: {
  sheet: SheetState
  setSheet: (s: SheetState) => void
  className?: string
  children: React.ReactNode
}) {
  const startY = React.useRef<number | null>(null)

  const handlePointerDown = (e: React.PointerEvent) => {
    startY.current = e.clientY
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const handlePointerUp = (e: React.PointerEvent) => {
    if (startY.current === null) return
    const delta = e.clientY - startY.current
    startY.current = null
    const threshold = 40
    if (delta < -threshold) {
      // arrastró hacia arriba → expandir
      setSheet(sheet === "collapsed" ? "mid" : "expanded")
    } else if (delta > threshold) {
      // hacia abajo → colapsar
      setSheet(sheet === "expanded" ? "mid" : "collapsed")
    } else {
      // tap → ciclo
      setSheet(sheet === "collapsed" ? "mid" : sheet === "mid" ? "expanded" : "collapsed")
    }
  }

  return (
    <div
      className={cn(
        "glass-strong absolute inset-x-0 bottom-0 z-20 rounded-t-[2rem] transition-all duration-300",
        className,
      )}
    >
      <button
        type="button"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="flex w-full cursor-grab items-center justify-center pb-2 pt-3 active:cursor-grabbing touch-none"
        aria-label="Cambiar tamaño de la lista"
      >
        <span className="h-1.5 w-10 rounded-full bg-foreground-muted/50" />
      </button>
      {children}
    </div>
  )
}

function SelectedChargerCard({ charger }: { charger: Charger }) {
  const { state } = usePlugo()
  const prob = chargerProbability(charger)
  const lvl = probabilityLevel(prob)
  const cls = probabilityClasses[lvl]
  const minutes = estimatedMinutes(charger.distanceKm)
  const compat = compatibility(charger, state.vehicle)

  return (
    <article className="glass-strong overflow-hidden rounded-3xl">
      <div className="flex items-start gap-3 p-4">
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-background-secondary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={charger.photo || "/placeholder.svg"} alt={charger.name} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold">{charger.name}</h3>
              <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-foreground-muted">
                <MapPin className="h-3 w-3" />
                {charger.distanceKm.toFixed(1)} km · {minutes} min
              </p>
            </div>
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1",
                cls.bg,
                cls.text,
                cls.ring,
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", cls.dot)} />
              {prob}%
            </span>
          </div>

          {compat.viaAdapter && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              <Plug className="h-3 w-3" />
              Compatible con tu adaptador
            </div>
          )}
          {!compat.compatible && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
              No compatible
            </div>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-overlay-1 px-2 py-0.5 text-[10px] text-foreground-muted">
              <Zap className="h-3 w-3" />
              {charger.power} kW
            </span>
            <span className="inline-flex items-center rounded-full bg-overlay-1 px-2 py-0.5 text-[10px] text-foreground-muted">
              {charger.connectors.join(" · ")}
            </span>
            <span className="inline-flex items-center rounded-full bg-overlay-1 px-2 py-0.5 text-[10px] font-medium text-foreground">
              {formatCOP(charger.pricePerKwh)}/kWh
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-border/60 p-3">
        <Button asChild variant="outline">
          <Link href={`/cargador/${charger.id}`}>Ver detalle</Link>
        </Button>
        <Button
          asChild
          disabled={!compat.compatible || charger.status !== "disponible"}
        >
          <Link
            href={
              compat.compatible && charger.status === "disponible" ? `/reserva/${charger.id}` : "#"
            }
          >
            <Navigation className="h-4 w-4" />
            {charger.status === "disponible" ? "Ir aquí" : "No disponible"}
          </Link>
        </Button>
      </div>

      <p className="border-t border-border/60 px-4 py-2 text-center text-[10px] uppercase tracking-widest text-foreground-soft">
        {probabilityLabel(prob)}
      </p>
    </article>
  )
}
