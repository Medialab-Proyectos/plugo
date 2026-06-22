"use client"

import * as React from "react"
import Link from "next/link"
import {
  BatteryCharging,
  Bell,
  CalendarClock,
  CarFront,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Gauge,
  Loader2,
  MapPinned,
  Navigation,
  Pencil,
  Plus,
  Power,
  Route,
  Satellite,
  ShieldCheck,
  TriangleAlert,
  Wrench,
  X,
  Zap,
} from "lucide-react"
import { BatteryModal } from "@/components/battery-modal"
import { ThemeToggle } from "@/components/theme-toggle"
import { chargers, documentTemplates } from "@/lib/mock-data"
import { compatibility, rankChargers } from "@/lib/decision"
import { realRange, currentConditions } from "@/lib/autonomy"
import { useCumbreva, type Vehicle } from "@/lib/cumbreva-context"
import { cn } from "@/lib/utils"

const HERO_FALLBACK = "/vehicle-byd-seagull-side-dark.jpg"

export default function InicioPage() {
  const { state, dispatch } = useCumbreva()
  const [batteryOpen, setBatteryOpen] = React.useState(false)

  const vehicles = state.vehicles.length > 0 ? state.vehicles : state.vehicle ? [state.vehicle] : []
  const activeIndex = Math.min(state.activeVehicleIndex, Math.max(vehicles.length - 1, 0))
  const activeVehicle = vehicles[activeIndex] ?? state.vehicle

  const compatibleChargers = React.useMemo(
    () => chargers.filter((charger) => compatibility(charger, activeVehicle).compatible),
    [activeVehicle],
  )
  const ranked = React.useMemo(() => rankChargers(compatibleChargers, activeVehicle), [compatibleChargers, activeVehicle])
  const nearest = ranked.primary ?? ranked.fallback ?? ranked.rest[0]
  const pendingDocs = documentTemplates.filter(
    (doc) => doc.status === "por-vencer" || doc.status === "vencido" || doc.status === "no-cargado",
  )

  return (
    <>
      <main className="w-full bg-[#f2f5f7] text-[#0b1622] md:flex md:h-dvh md:flex-col md:overflow-hidden">
        <CorporateHeader />

        <div className="mx-auto w-full max-w-[1120px] px-5 pt-4 sm:px-6 md:flex-1 md:overflow-hidden md:px-8 md:pb-6">
          {activeVehicle ? (
            <div className="grid gap-4 md:h-full md:grid-cols-[1.3fr_1fr] md:items-stretch">
              <SmartRouteHero
                className="min-w-0 md:h-full"
                vehicle={activeVehicle}
                vehicles={vehicles}
                activeIndex={activeIndex}
                onSelectVehicle={(index) => dispatch({ type: "SET_ACTIVE_VEHICLE", index })}
                battery={state.battery ?? 0}
                prefs={state.preferences}
                onBatteryClick={() => setBatteryOpen(true)}
              />
              <div className="no-scrollbar flex min-h-0 min-w-0 flex-col gap-4 md:overflow-y-auto">
                <RecommendationPush battery={state.battery ?? 0} pendingDocs={pendingDocs} />
                <ActionDock nearest={nearest} docsAlert={pendingDocs.length > 0} />
                <TrustMessage />
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-[520px]">
              <EmptyStateCard />
            </div>
          )}
        </div>
      </main>
      <BatteryModal open={batteryOpen} onOpenChange={setBatteryOpen} />
    </>
  )
}

function CorporateHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#dfe5eb] bg-[#f2f5f7]/95 px-5 pb-3 pt-[max(env(safe-area-inset-top),1rem)] backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1120px] items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#05c46b] text-[#061611] shadow-[0_14px_28px_-18px_rgba(5,196,107,0.95)]">
            <Zap className="h-5 w-5 fill-current" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[24px] font-black leading-none text-[#0b1622]">CUMBREVA</p>
            <p className="mt-1.5 truncate text-[10px] font-bold leading-none text-[#657384]">Tu copiloto electrico</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle className="text-[#22313f]" />
          <button
            aria-label="Ayuda"
            className="grid h-9 w-9 place-items-center rounded-full text-[#536170] active:bg-black/5"
          >
            <CircleHelp className="h-5 w-5" />
          </button>
          <button
            aria-label="Notificaciones"
            className="relative grid h-9 w-9 place-items-center rounded-full text-[#536170] active:bg-black/5"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary ring-2 ring-[#f2f5f7]" />
          </button>
        </div>
      </div>
    </header>
  )
}

function SmartRouteHero({
  vehicle,
  vehicles,
  activeIndex,
  onSelectVehicle,
  battery,
  prefs,
  onBatteryClick,
  className,
}: {
  vehicle: Vehicle
  vehicles: Vehicle[]
  activeIndex: number
  onSelectVehicle: (index: number) => void
  battery: number
  prefs: ReturnType<typeof useCumbreva>["state"]["preferences"]
  onBatteryClick: () => void
  className?: string
}) {
  const hasMany = vehicles.length > 1
  const slots = hasMany ? vehicles.length + 1 : 1
  const [viewingCreate, setViewingCreate] = React.useState(false)
  const pos = viewingCreate ? vehicles.length : activeIndex

  React.useEffect(() => {
    setViewingCreate(false)
  }, [activeIndex])

  function go(index: number) {
    const next = (index + slots) % slots
    if (next >= vehicles.length) {
      setViewingCreate(true)
      return
    }
    setViewingCreate(false)
    onSelectVehicle(next)
  }

  const carouselControls = hasMany ? (
    <>
      <button
        type="button"
        onClick={() => go(pos - 1)}
        aria-label="Vehiculo anterior"
        className="absolute left-0 top-0 z-20 h-full w-16 text-transparent focus-visible:text-white focus-visible:outline-none"
      >
        <ChevronLeft className="mx-auto h-5 w-5 opacity-0 focus-visible:opacity-100" />
      </button>
      <button
        type="button"
        onClick={() => go(pos + 1)}
        aria-label="Vehiculo siguiente"
        className="absolute right-0 top-0 z-20 h-full w-16 text-transparent focus-visible:text-white focus-visible:outline-none"
      >
        <ChevronRight className="mx-auto h-5 w-5 opacity-0 focus-visible:opacity-100" />
      </button>
      <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 opacity-0 focus-within:opacity-100">
        {Array.from({ length: slots }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => go(i)}
            aria-label={i >= vehicles.length ? "Agregar vehiculo" : `Vehiculo ${i + 1}`}
            className={cn("h-1.5 rounded-full transition-all", i === pos ? "w-5 bg-white" : "w-1.5 bg-white/55")}
          />
        ))}
      </div>
    </>
  ) : null

  return (
    <div className={cn("min-w-0", className)}>
      {viewingCreate ? (
        <CreateVehicleCard carouselControls={carouselControls} />
      ) : (
        <VehicleCardFace
          vehicle={vehicle}
          battery={battery}
          prefs={prefs}
          onBatteryClick={onBatteryClick}
          carouselControls={carouselControls}
        />
      )}
    </div>
  )
}

function CreateVehicleCard({ carouselControls }: { carouselControls: React.ReactNode }) {
  return (
    <section className="relative flex min-h-[356px] flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_22px_45px_-34px_rgba(11,22,34,0.55)] ring-1 ring-black/5 md:h-full">
      <div className="relative flex min-h-[210px] flex-1 items-center justify-center bg-[#071210]">
        {carouselControls}
        <div className="grid h-16 w-16 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20">
          <Plus className="h-8 w-8" />
        </div>
      </div>
      <div className="p-5">
        <p className="text-lg font-black text-[#0b1622]">Agregar vehiculo</p>
        <p className="mt-1 text-sm font-medium text-[#667384]">Suma otro electrico a tu garaje.</p>
        <Link
          href="/vehiculo/nuevo"
          className="mt-5 flex h-12 items-center justify-center gap-2 rounded-[18px] bg-primary text-sm font-bold text-primary-foreground active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Crear vehiculo
        </Link>
      </div>
    </section>
  )
}

function VehicleCardFace({
  vehicle,
  battery,
  prefs,
  onBatteryClick,
  carouselControls,
}: {
  vehicle: Vehicle
  battery: number
  prefs: ReturnType<typeof useCumbreva>["state"]["preferences"]
  onBatteryClick: () => void
  carouselControls: React.ReactNode
}) {
  const autonomyKm = React.useMemo(
    () => realRange(vehicle, battery, currentConditions(prefs)).km,
    [vehicle, battery, prefs],
  )
  const trip = tripStatus(battery)
  const chargeLabel = battery < 50 ? "Carga recomendada" : trip.label
  const heroPhoto = vehicle.photo && vehicle.photo !== "/Dominio/SofIma/home-car.png" ? vehicle.photo : HERO_FALLBACK

  const pendingDocs = React.useMemo(
    () =>
      documentTemplates.filter(
        (doc) => doc.status === "por-vencer" || doc.status === "vencido" || doc.status === "no-cargado",
      ),
    [],
  )

  const [started, setStarted] = React.useState(false)
  const [running, setRunning] = React.useState(false)
  const [checkStep, setCheckStep] = React.useState(0)
  const [displayBattery, setDisplayBattery] = React.useState(battery)
  const [displayAutonomy, setDisplayAutonomy] = React.useState(autonomyKm)

  React.useEffect(() => {
    if (!running) {
      setDisplayBattery(battery)
      setDisplayAutonomy(autonomyKm)
    }
  }, [battery, autonomyKm, running])

  React.useEffect(() => {
    setStarted(false)
    setRunning(false)
    setCheckStep(0)
  }, [vehicle.id])

  function handleToggle() {
    if (running) return
    if (started) {
      setStarted(false)
      setCheckStep(0)
      return
    }
    handlePrender()
  }

  function handlePrender() {
    if (running || started) return
    setStarted(true)
    setRunning(true)
    setCheckStep(0)
    setDisplayBattery(0)
    setDisplayAutonomy(0)

    const duration = 1500
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setDisplayBattery(Math.round(ease * battery))
      setDisplayAutonomy(Math.round(ease * autonomyKm))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)

    setTimeout(() => setCheckStep(1), 600)
    setTimeout(() => setCheckStep(2), 1200)
    setTimeout(() => setCheckStep(3), 1800)
    setTimeout(() => setCheckStep(4), 2300)
    setTimeout(() => setRunning(false), 2800)
  }

  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden rounded-[28px] bg-white text-[#0b1622] shadow-[0_22px_45px_-34px_rgba(11,22,34,0.55)] ring-1 ring-black/5 transition-colors md:h-full",
        started && "animate-cumbreva-halo-soft ring-primary/30",
      )}
    >
      <div className="relative h-[200px] w-full overflow-hidden bg-[#071210] md:h-auto md:min-h-[260px] md:flex-[3]">
        <img
          src={heroPhoto}
          alt={vehicle.name}
          className="pointer-events-none h-full w-full object-cover object-center"
          draggable={false}
        />
        {carouselControls}

        <button
          type="button"
          onClick={handleToggle}
          disabled={running}
          aria-pressed={started}
          aria-label={started ? "Apagar vehiculo" : "Prender vehiculo"}
          className={cn(
            "absolute right-3 top-3 z-20 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold backdrop-blur-sm transition active:scale-95",
            started ? "bg-primary text-primary-foreground" : "bg-black/35 text-white",
          )}
        >
          <Power className="h-3.5 w-3.5" />
          {started ? "Apagar" : "Prender"}
        </button>

        {running && (
          <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/80 via-black/55 to-transparent px-4 pb-3 pt-7">
            <ul className="space-y-1">
              <CheckRow active={checkStep >= 1} label="Bateria verificada" />
              <CheckRow
                active={checkStep >= 2}
                label="GPS activado - Autonomia y seguimiento"
                icon={<Satellite className="h-3.5 w-3.5 text-primary" />}
              />
              <CheckRow
                active={checkStep >= 3}
                label={pendingDocs.length > 0 ? `${pendingDocs.length} documento(s) pendiente(s)` : "Documentos al dia"}
                warn={pendingDocs.length > 0}
              />
              <CheckRow active={checkStep >= 4} label="Listo para salir" />
            </ul>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 p-5 md:flex-[2] md:justify-center">
        <div className="flex items-center justify-between gap-3">
          <h1 className="min-w-0 truncate text-lg font-black leading-tight text-[#0b1622]">{vehicle.name}</h1>
          <span
            className={cn(
              "flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold",
              battery < 50 ? "bg-[#fff4d7] text-[#d08a00]" : "bg-primary/10 text-primary",
            )}
          >
            {battery < 50 ? <TriangleAlert className="h-3 w-3" /> : <trip.Icon className="h-3 w-3" />}
            {chargeLabel}
          </span>
        </div>

        <div className="grid grid-cols-2">
          <button
            type="button"
            onClick={onBatteryClick}
            className="flex flex-col items-start gap-1 pr-3 text-left transition active:opacity-70"
          >
            <span className="flex items-center gap-1 text-xs font-semibold uppercase text-[#647386]">
              <BatteryCharging className="h-3 w-3 text-primary" />
              Bateria
            </span>
            <span className="flex items-center gap-1.5 text-[22px] font-black leading-none text-[#0b1622]">
              {displayBattery}%
              <Pencil className="h-3.5 w-3.5 text-primary" />
            </span>
          </button>

          <div className="flex flex-col items-start gap-1 border-l border-[#dfe5eb] pl-4">
            <span className="flex items-center gap-1 text-xs font-semibold uppercase text-[#647386]">
              <Gauge className="h-3 w-3 text-primary" />
              Autonomia
            </span>
            <span className="text-[22px] font-black leading-none text-[#0b1622]">~{displayAutonomy} km</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/rutas"
            className="flex h-11 items-center justify-center gap-2 rounded-[18px] bg-[#05c46b] text-sm font-black text-white active:scale-[0.98]"
          >
            <Route className="h-4 w-4" />
            Planear ruta
          </Link>
          <Link
            href="/mapa"
            className={cn(
              "relative flex h-11 items-center justify-center gap-2 rounded-[18px] border border-[#dfe5eb] bg-white text-sm font-black text-[#0b1622] transition-all active:scale-[0.98]",
              battery < 40 && "charge-glow-btn",
            )}
          >
            <BatteryCharging className="h-4 w-4 text-primary" />
            Cargar
          </Link>
        </div>
      </div>
    </section>
  )
}

function CheckRow({ active, label, icon, warn }: { active: boolean; label: string; icon?: React.ReactNode; warn?: boolean }) {
  return (
    <li className="flex items-center gap-2 text-[11px] font-semibold">
      {active ? (
        icon ?? <CheckCircle2 className={cn("h-3.5 w-3.5", warn ? "text-warning" : "text-primary")} />
      ) : (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-white/70" />
      )}
      <span className={cn(active ? (warn ? "text-warning" : "text-white") : "text-white/70")}>{label}</span>
    </li>
  )
}

function tripStatus(battery: number): {
  tone: "ok" | "warn" | "risk"
  label: string
  copilot: string
  Icon: typeof ShieldCheck
} {
  if (battery >= 50) {
    return {
      tone: "ok",
      label: "Carga optima",
      copilot: "Con tu bateria actual puedes moverte con confianza.",
      Icon: BatteryCharging,
    }
  }
  if (battery >= 25) {
    return {
      tone: "warn",
      label: "Carga media",
      copilot: "Te alcanza para hoy, pero considera una carga corta antes de un viaje largo.",
      Icon: TriangleAlert,
    }
  }
  return {
    tone: "risk",
    label: "Carga baja",
    copilot: "Te recomendamos cargar antes de continuar para viajar con tranquilidad.",
    Icon: TriangleAlert,
  }
}

function RecommendationPush({
  battery,
  pendingDocs,
}: {
  battery: number
  pendingDocs: { name: string; status: string }[]
}) {
  const [dismissed, setDismissed] = React.useState(false)
  const trip = tripStatus(battery)
  const hasVencido = pendingDocs.some((doc) => doc.status === "vencido")

  const alert =
    pendingDocs.length > 0
      ? {
          tone: hasVencido ? ("risk" as const) : ("warn" as const),
          kicker: `Alerta - ${pendingDocs.length} documento${pendingDocs.length > 1 ? "s" : ""}`,
          text: hasVencido
            ? "Tienes documentos vencidos que requieren atencion."
            : "Algunos documentos estan por vencer o sin cargar.",
          Icon: TriangleAlert,
          href: "/documentos" as string | undefined,
        }
      : trip.tone === "risk"
        ? {
            tone: trip.tone,
            kicker: `Recomendacion - ${trip.label}`,
            text: trip.copilot,
            Icon: trip.Icon,
            href: undefined as string | undefined,
          }
        : null

  if (dismissed || !alert) return null

  const body = (
    <>
      <p className="text-[11px] font-bold uppercase text-[#647386]">{alert.kicker}</p>
      <p className="mt-0.5 text-[13px] font-semibold leading-snug text-[#0b1622]">{alert.text}</p>
    </>
  )

  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 rounded-[22px] border bg-white p-3.5 shadow-[0_14px_32px_-28px_rgba(11,22,34,0.5)]",
        alert.tone === "warn" && "border-[#f5d37c]",
        alert.tone === "risk" && "border-destructive/30",
      )}
    >
      <span
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-full",
          alert.tone === "warn" && "bg-[#fff4d7] text-[#d08a00]",
          alert.tone === "risk" && "bg-destructive/12 text-destructive",
        )}
      >
        <alert.Icon className="h-4 w-4" />
      </span>
      {alert.href ? (
        <Link href={alert.href} className="min-w-0 flex-1">
          {body}
        </Link>
      ) : (
        <div className="min-w-0 flex-1">{body}</div>
      )}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Descartar alerta"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[#647386] active:bg-black/5"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

function ActionDock({ nearest, docsAlert }: { nearest?: (typeof chargers)[number]; docsAlert?: boolean }) {
  const items = [
    { href: "/mi-vehiculo", label: "Vehiculo", icon: CarFront, bg: "#ebe8ff", fg: "#6760d9" },
    { href: "/servicios", label: "Servicios", icon: Wrench, bg: "#e4f0ff", fg: "#1677ff" },
    {
      href: "/documentos",
      label: "Auto Vault",
      icon: ShieldCheck,
      bg: docsAlert ? "#ffe4eb" : "#e7f8ec",
      fg: docsAlert ? "#ff426a" : "#13b867",
      alert: !!docsAlert,
    },
    { href: "/perfil/recompensas", label: "Beneficios", icon: CalendarClock, bg: "#fff6d8", fg: "#d29a00" },
    { href: nearest ? `/cargador/${nearest.id}` : "/mapa", label: "Electrolineras", icon: Navigation, bg: "#e5f1ff", fg: "#1680ff" },
    { href: "/mapa", label: "Mapa", icon: MapPinned, bg: "#ddf8f4", fg: "#00aaa0" },
  ]

  return (
    <section aria-labelledby="ecosystem-title">
      <p id="ecosystem-title" className="mb-3 text-sm font-semibold text-[#3d4b5a]">
        Todo a mano
      </p>
      <div className="grid grid-cols-3 gap-x-4 gap-y-6">
        {items.map(({ href, label, icon: Icon, bg, fg, alert }) => (
          <Link key={label} href={href} className="flex flex-col items-center gap-2 text-center active:scale-[0.97]">
            <span className="relative grid h-12 w-12 place-items-center rounded-full" style={{ backgroundColor: bg, color: fg }}>
              <Icon className="h-5 w-5" strokeWidth={1.9} />
              {alert && (
                <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-destructive" />
                </span>
              )}
            </span>
            <span className="text-xs font-medium leading-tight text-[#2d3b49]">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

function TrustMessage() {
  return (
    <p className="flex items-center gap-1.5 text-[10px] font-medium text-[#7a8795]">
      <ShieldCheck className="h-3 w-3 shrink-0" />
      Tu vehiculo y documentos, siempre bajo control.
    </p>
  )
}

function EmptyStateCard() {
  return (
    <Link
      href="/vehiculo/nuevo"
      className="flex h-[280px] items-center justify-center rounded-[28px] border border-dashed border-[#dfe5eb] bg-white text-sm font-bold text-primary"
    >
      Registrar vehiculo
    </Link>
  )
}
