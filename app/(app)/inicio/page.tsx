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
  FileText,
  Gauge,
  Loader2,
  MapPinned,
  Navigation,
  Package,
  Pencil,
  Plus,
  Power,
  Route,
  Satellite,
  ShieldCheck,
  TriangleAlert,
  Wrench,
  X,
} from "lucide-react"
import { BatteryModal } from "@/components/battery-modal"
import { ThemeToggle } from "@/components/theme-toggle"
import { chargers, documentTemplates } from "@/lib/mock-data"
import { compatibility, rankChargers } from "@/lib/decision"
import { realRange, currentConditions } from "@/lib/autonomy"
import { useCumbreva, type Vehicle } from "@/lib/cumbreva-context"
import { CumbrevaLogo } from "@/components/cumbreva-logo"
import { cn } from "@/lib/utils"

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
  const docsAlert = pendingDocs.length > 0

  return (
    <>
      {/* Web app responsive: en desktop el contenido usa el ancho en 2 columnas,
          en móvil se apila. Scroll del documento, sin marco de celular. */}
      <main className="w-full bg-background text-foreground md:flex md:h-dvh md:flex-col md:overflow-hidden">
        <CorporateHeader userName={state.userName} />

        <div className="mx-auto w-full max-w-[1120px] px-4 pt-4 sm:px-6 md:flex-1 md:overflow-hidden md:px-8 md:pb-6">
          {activeVehicle ? (
            <div className="grid gap-4 md:h-full md:grid-cols-[1.3fr_1fr] md:items-stretch">
              <SmartRouteHero
                className="md:h-full"
                vehicle={activeVehicle}
                vehicles={vehicles}
                activeIndex={activeIndex}
                onSelectVehicle={(index) => dispatch({ type: "SET_ACTIVE_VEHICLE", index })}
                battery={state.battery ?? 0}
                prefs={state.preferences}
                onBatteryClick={() => setBatteryOpen(true)}
              />
              <div className="no-scrollbar flex min-h-0 flex-col gap-4 md:overflow-y-auto">
                <DocumentAlerts />
                <RecommendationPush battery={state.battery ?? 0} />
                <ActionDock nearest={nearest} docsAlert={docsAlert} battery={state.battery ?? 0} />
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

/* ────────────────────────────────────────────────────────────────────────────
   Header corporativo — cuadrado, limpio, premium. Adaptable light/dark vía tokens.
   Deja safe-area superior para móviles reales, SIN simular un teléfono.
   El nombre de la app tiene la máxima jerarquía visual.
   ──────────────────────────────────────────────────────────────────────────── */
function CorporateHeader({ userName }: { userName: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 px-4 pb-3 pt-[max(env(safe-area-inset-top),1rem)] backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1120px] items-center justify-between gap-3">
        {/* Móvil: el logo de la app con su eslogan bajo la C. Desktop: CUMBREVA ya está en el sidebar. */}
        <div className="flex min-w-0 md:hidden">
          <CumbrevaLogo size="md" />
        </div>
        <div className="hidden min-w-0 md:block">
          <p className="truncate text-xl font-black tracking-tight text-foreground">
            {userName ? `Hola, ${userName}` : "Bienvenido"}
          </p>
          <p className="text-sm font-medium text-foreground-muted">Tu copiloto eléctrico</p>
        </div>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <button
            aria-label="Ayuda"
            className="grid h-10 w-10 place-items-center rounded-full text-foreground-muted active:bg-overlay-hover"
          >
            <CircleHelp className="h-5 w-5" />
          </button>
          <button
            aria-label="Notificaciones"
            className="relative grid h-10 w-10 place-items-center rounded-full text-foreground-muted active:bg-overlay-hover"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
          </button>
        </div>
      </div>
    </header>
  )
}

/* ────────────────────────────────────────────────────────────────────────────
   Tarjeta principal del vehículo.
   · Carro presentado sobre un escenario premium (no imagen negra pegada).
   · Animación sutil: respiración + brillo + reflejo.
   · Texto SIEMPRE debajo del carro, sin solaparse.
   · Métricas útiles y explicadas: batería, autonomía estimada, estado del viaje.
   ──────────────────────────────────────────────────────────────────────────── */
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
  const autonomyKm = React.useMemo(
    () => realRange(vehicle, battery, currentConditions(prefs)).km,
    [vehicle, battery, prefs],
  )

  const trip = tripStatus(battery)
  const subtitle = [vehicle.brand, vehicle.model].filter(Boolean).join(" ")
  const hasMany = vehicles.length > 1

  // Carrusel: con varios vehículos se agrega un slot final para "Crear vehículo".
  const slots = hasMany ? vehicles.length + 1 : 1
  const [viewingCreate, setViewingCreate] = React.useState(false)
  const pos = viewingCreate ? vehicles.length : activeIndex

  function go(index: number) {
    const next = (index + slots) % slots
    if (next >= vehicles.length) {
      setViewingCreate(true)
    } else {
      setViewingCreate(false)
      onSelectVehicle(next)
    }
  }

  function renderCarousel(onDark: boolean) {
    if (!hasMany || running) return null
    const chip = onDark ? "bg-black/45 text-white" : "bg-foreground/10 text-foreground-muted"
    const arrow = onDark
      ? "bg-black/60 text-white ring-1 ring-white/20"
      : "border border-border-strong bg-card text-foreground"
    return (
      <>
        <span className={cn("absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold backdrop-blur-sm", chip)}>
          {viewingCreate ? <Plus className="h-3 w-3" /> : <CarFront className="h-3 w-3" />}
          {viewingCreate ? "Nuevo" : `${activeIndex + 1}/${vehicles.length}`}
        </span>
        <button
          type="button"
          onClick={() => go(pos - 1)}
          aria-label="Anterior"
          className={cn("absolute left-2 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full shadow-lg backdrop-blur-sm transition active:scale-90", arrow)}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => go(pos + 1)}
          aria-label="Siguiente"
          className={cn("absolute right-2 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full shadow-lg backdrop-blur-sm transition active:scale-90", arrow)}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
          {Array.from({ length: slots }).map((_, i) => {
            const active = i === pos
            const activeCls = onDark ? "w-5 bg-white" : "w-5 bg-primary"
            const idleCls = onDark ? "w-1.5 bg-white/50" : "w-1.5 bg-foreground/30"
            return (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={i >= vehicles.length ? "Crear vehículo" : `Vehículo ${i + 1}`}
                className={cn("h-1.5 rounded-full transition-all", active ? activeCls : idleCls)}
              />
            )
          })}
        </div>
      </>
    )
  }

  // "Prender": efecto visual — la batería y la autonomía suben de 0 al valor real
  // y corre un chequeo (batería · documentos · listo). Es solo confirmación de que
  // el vehículo está listo; el usuario puede usar la app sin prenderlo.
  const [started, setStarted] = React.useState(false)
  const [running, setRunning] = React.useState(false)
  const [checkStep, setCheckStep] = React.useState(0)
  const [displayBattery, setDisplayBattery] = React.useState(battery)
  const [displayAutonomy, setDisplayAutonomy] = React.useState(autonomyKm)

  // Mientras no esté prendido, los valores siguen al estado real.
  React.useEffect(() => {
    if (!started) {
      setDisplayBattery(battery)
      setDisplayAutonomy(autonomyKm)
    }
  }, [battery, autonomyKm, started])

  // Al cambiar de vehículo se reinicia el encendido.
  React.useEffect(() => {
    setStarted(false)
    setRunning(false)
    setCheckStep(0)
  }, [vehicle.id])

  function handleToggle() {
    if (running) return
    if (started) {
      // Apagar: vuelve a "Prender" y los valores se resincronizan con el estado real.
      setStarted(false)
      setCheckStep(0)
      return
    }
    handlePrender()
  }

  // Documentos pendientes/vencidos para mostrar al prender
  const pendingDocs = React.useMemo(
    () => documentTemplates.filter(
      (doc) => doc.status === "por-vencer" || doc.status === "vencido" || doc.status === "no-cargado",
    ),
    [],
  )
  const [showDocAlerts, setShowDocAlerts] = React.useState(false)

  function handlePrender() {
    if (running || started) return
    setStarted(true)
    setRunning(true)
    setCheckStep(0)
    setDisplayBattery(0)
    setDisplayAutonomy(0)
    setShowDocAlerts(false)

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

    setTimeout(() => setCheckStep(1), 600)   // Batería verificada
    setTimeout(() => setCheckStep(2), 1200)  // GPS activado
    setTimeout(() => setCheckStep(3), 1800)  // Documentos
    setTimeout(() => setCheckStep(4), 2300)  // Listo
    setTimeout(() => {
      setRunning(false)
      if (pendingDocs.length > 0) setShowDocAlerts(true)
    }, 2800)
  }

  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden rounded-[24px] border bg-card shadow-[0_24px_60px_-36px_rgba(0,0,0,0.5)] transition-colors",
        started ? "border-primary/30 animate-cumbreva-halo-soft" : "border-border",
        className,
      )}
    >
      {viewingCreate ? (
        /* Slot final del carrusel: crear vehículo (tarjeta vacía, sin métricas). */
        <div className="relative flex min-h-[280px] flex-1 flex-col items-center justify-center gap-3 p-6 text-center md:min-h-0">
          {renderCarousel(false)}
          <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/12 text-primary">
            <Plus className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Agregar otro vehículo</p>
            <p className="mt-1 text-xs text-foreground-muted">Suma un vehículo a tu garaje</p>
          </div>
          <Link
            href="/vehiculo/nuevo"
            className="mt-1 flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-[13px] font-semibold text-primary-foreground active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Crear vehículo
          </Link>
        </div>
      ) : (
        <>
          {/* Foto del vehículo: fija, como fondo que cubre toda la parte superior de la tarjeta. */}
          <div className="relative h-[150px] w-full overflow-hidden md:h-auto md:min-h-[190px] md:flex-[3]">
            <img
              src={vehicle.photo || "/vehicle-byd-seagull-side-dark.jpg"}
              alt={vehicle.name}
              className="h-full w-full object-cover object-center"
            />

            {/* Carrusel: contador + flechas + dots (incluye slot de creación) */}
            {renderCarousel(true)}

            {/* Botón Prender / Apagar */}
            <button
              type="button"
              onClick={handleToggle}
              disabled={running}
              aria-pressed={started}
              aria-label={started ? "Apagar vehículo" : "Prender vehículo"}
              className={cn(
                "absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold backdrop-blur-sm transition active:scale-95",
                started ? "bg-primary text-primary-foreground" : "bg-black/45 text-white",
              )}
            >
              <Power className="h-3.5 w-3.5" />
              {started ? "Apagar" : "Prender"}
            </button>

            {/* Secuencia de chequeo al prender */}
            {running && (
              <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/55 to-transparent px-4 pb-3 pt-7">
                <ul className="space-y-1">
                  <CheckRow active={checkStep >= 1} label="Batería verificada" />
                  <CheckRow active={checkStep >= 2} label="GPS activado · Autonomía y seguimiento" icon={<Satellite className="h-3.5 w-3.5 text-primary" />} />
                  <CheckRow active={checkStep >= 3} label={pendingDocs.length > 0 ? `${pendingDocs.length} documento(s) pendiente(s)` : "Documentos al día"} warn={pendingDocs.length > 0} />
                  <CheckRow active={checkStep >= 4} label="Listo para salir" />
                </ul>
              </div>
            )}
          </div>

          {/* Sector de información (~40%): compacto, organizado y accesible. */}
          <div className="flex flex-col gap-2.5 border-t border-border p-4 md:flex-[2] md:justify-center">
            {/* Nombre + estado */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="truncate text-base font-bold leading-tight text-foreground">{vehicle.name}</h1>
                {subtitle && (
                  <p className="mt-0.5 truncate text-[11px] font-medium text-foreground-muted">
                    {subtitle}
                    {vehicle.year ? ` · ${vehicle.year}` : ""}
                  </p>
                )}
              </div>
              <span
                className={cn(
                  "flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold",
                  trip.tone === "ok" && "bg-primary/12 text-primary",
                  trip.tone === "warn" && "bg-warning/15 text-warning",
                  trip.tone === "risk" && "bg-destructive/12 text-destructive",
                )}
              >
                <trip.Icon className="h-3 w-3" />
                {trip.label}
              </span>
            </div>

            {/* Métricas compactas */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onBatteryClick}
                className="flex flex-col items-start gap-1 text-left transition active:opacity-70"
              >
                <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-foreground-muted">
                  <BatteryCharging className="h-3 w-3 text-primary" />
                  Batería
                </span>
                <span className="flex items-center gap-1.5 text-xl font-semibold leading-none text-foreground">
                  {displayBattery}%
                  <Pencil className="h-3 w-3 text-primary" />
                </span>
              </button>

              <div className="flex flex-col items-start gap-1 border-l border-border pl-3">
                <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-foreground-muted">
                  <Gauge className="h-3 w-3 text-primary" />
                  Autonomía
                </span>
                <span className="text-xl font-semibold leading-none text-foreground">~{displayAutonomy} km</span>
              </div>
            </div>

            {/* Acciones principales */}
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/rutas"
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-[13px] font-semibold text-primary-foreground active:scale-[0.98]"
              >
                <Route className="h-4 w-4" />
                Planear ruta
              </Link>
              <Link
                href={nearestHref()}
                className={cn(
                  "relative flex h-11 items-center justify-center gap-2 rounded-xl border text-[13px] font-semibold active:scale-[0.98] transition-all",
                  battery < 40
                    ? "border-yellow-500/40 bg-yellow-500/8 text-yellow-400 charge-glow-btn"
                    : "border-border-strong bg-card text-foreground",
                )}
              >
                <BatteryCharging className={cn("h-4 w-4", battery < 40 ? "text-yellow-400" : "text-primary")} />
                Cargar
              </Link>
            </div>
          </div>
        </>
      )}
    </section>
  )

  function nearestHref() {
    return "/mapa"
  }
}

/** Una fila del chequeo de "Prender": cargando (spinner) → verificado (check). */
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

/** Estado de viaje legible a partir de la batería — sin métricas crípticas. */
function tripStatus(battery: number): {
  tone: "ok" | "warn" | "risk"
  label: string
  copilot: string
  Icon: typeof ShieldCheck
} {
  if (battery >= 50) {
    return {
      tone: "ok",
      label: "Carga óptima",
      copilot: "Con tu batería actual puedes moverte con confianza.",
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

/** Recomendación como notificación push: se puede descartar con la X. */
function RecommendationPush({ battery }: { battery: number }) {
  const trip = tripStatus(battery)
  const [dismissed, setDismissed] = React.useState(false)
  // Las alertas/recomendaciones solo salen cuando hay algo que atender, no cuando todo está bien.
  if (dismissed || trip.tone === "ok") return null
  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 rounded-2xl border bg-card p-3.5 shadow-[0_12px_30px_-20px_rgba(0,0,0,0.5)]",
        trip.tone === "warn" && "border-warning/30",
        trip.tone === "risk" && "border-destructive/30",
      )}
    >
      <span
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-full",
          trip.tone === "warn" && "bg-warning/15 text-warning",
          trip.tone === "risk" && "bg-destructive/12 text-destructive",
        )}
      >
        <trip.Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wide text-foreground-muted">
          Recomendación · {trip.label}
        </p>
        <p className="mt-0.5 text-[13px] font-medium leading-snug text-foreground">{trip.copilot}</p>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Descartar recomendación"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-foreground-muted active:bg-overlay-hover"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

function ActionDock({ nearest, docsAlert, battery }: { nearest?: (typeof chargers)[number]; docsAlert?: boolean; battery: number }) {
  const items = [
    { href: "/mi-vehiculo", label: "Garaje", icon: CarFront, bg: "#5856d63d", fg: "#7b79e6", alert: false },
    { href: "/servicios", label: "Servicios", icon: Wrench, bg: "#007aff3d", fg: "#4da3ff", alert: false },
    {
      href: "/documentos",
      label: "Documentos",
      icon: FileText,
      bg: docsAlert ? "#ff2d553d" : "#34c7593d",
      fg: docsAlert ? "#ff6b88" : "#46d36a",
      alert: !!docsAlert,
    },
    { href: "/perfil/recompensas", label: "Beneficios", icon: CalendarClock, bg: "#ffcc003d", fg: "#ffd633", alert: false },
    { href: nearest ? `/cargador/${nearest.id}` : "/mapa", label: "Electrolineras", icon: Navigation, bg: "#00c7be3d", fg: "#2dd4c8", alert: false },
    { href: "/mapa", label: "Mapa", icon: MapPinned, bg: "#34c7593d", fg: "#46d36a", alert: false },
  ]

  return (
    <section aria-labelledby="ecosystem-title">
      <div className="mb-3 flex items-center gap-1.5">
        <Package className="h-3.5 w-3.5 text-foreground" />
        <p id="ecosystem-title" className="text-xs font-semibold text-foreground">
          Todo a mano
        </p>
      </div>
      <div className="grid grid-cols-3 gap-x-2 gap-y-4">
        {items.map(({ href, label, icon: Icon, bg, fg, alert }) => (
          <Link
            key={label}
            href={href}
            className="flex flex-col items-center gap-1.5 text-center active:scale-[0.97]"
          >
            <span className="relative grid h-12 w-12 place-items-center rounded-full" style={{ backgroundColor: bg, color: fg }}>
              <Icon className="h-5 w-5" strokeWidth={1.9} />
              {alert && (
                <span
                  className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-card bg-destructive"
                  aria-label="Tiene pendientes"
                />
              )}
            </span>
            <span className="text-[11px] font-medium leading-tight text-foreground-muted">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

/** Mensaje de confianza/seguridad debajo del menú "Todo a mano" */
function TrustMessage() {
  return (
    <p className="flex items-center gap-1.5 text-[10px] font-medium text-foreground-soft">
      <ShieldCheck className="h-3 w-3 shrink-0 text-foreground-soft" />
      Tu vehículo y documentos, siempre bajo control.
    </p>
  )
}

function DocumentAlerts() {
  const [dismissed, setDismissed] = React.useState(false)
  const pendingDocs = documentTemplates.filter(
    (doc) => doc.status === "por-vencer" || doc.status === "vencido" || doc.status === "no-cargado",
  )
  if (dismissed || pendingDocs.length === 0) return null

  return (
    <div className="relative">
      {/* Sombras apiladas detrás */}
      {pendingDocs.length > 1 && (
        <div className="absolute inset-x-1.5 top-1.5 h-full rounded-2xl border border-destructive/15 bg-card/80" />
      )}
      {pendingDocs.length > 2 && (
        <div className="absolute inset-x-3 top-3 h-full rounded-2xl border border-destructive/10 bg-card/60" />
      )}
      {/* Tarjeta frontal */}
      <div
        className="relative flex items-start gap-3 rounded-2xl border border-destructive/30 bg-card p-3.5 shadow-[0_12px_30px_-20px_rgba(0,0,0,0.5)]"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-destructive/12 text-destructive">
          <TriangleAlert className="h-4 w-4" />
        </span>
        <Link href="/documentos" className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wide text-foreground-muted">
            Alerta · {pendingDocs.length} documento{pendingDocs.length > 1 ? "s" : ""}
          </p>
          <p className="mt-0.5 text-[13px] font-medium leading-snug text-foreground">
            {pendingDocs.some((d) => d.status === "vencido")
              ? "Tienes documentos vencidos que requieren atención inmediata."
              : "Algunos documentos están por vencer o no han sido cargados."}
          </p>
          <p className="mt-1 truncate text-[10px] font-medium text-foreground-muted">
            {pendingDocs.map((d) => d.name).join(" · ")}
          </p>
        </Link>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Descartar alerta"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-foreground-muted active:bg-overlay-hover"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function EmptyStateCard() {
  return (
    <Link
      href="/vehiculo/nuevo"
      className="flex h-[280px] items-center justify-center rounded-[28px] border border-dashed border-border bg-card text-sm font-semibold text-primary"
    >
      Registrar vehículo
    </Link>
  )
}
