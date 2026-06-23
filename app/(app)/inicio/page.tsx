"use client"

import * as React from "react"
import Link from "next/link"
import {
  BatteryCharging,
  Bell,
  CalendarClock,
  CarFront,
  CheckCircle2,
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
import { watchPosition } from "@/lib/geolocation"
import { cn } from "@/lib/utils"

export default function InicioPage() {
  const { state, dispatch } = useCumbreva()
  const [batteryOpen, setBatteryOpen] = React.useState(false)
  const [viewingCreateVehicle, setViewingCreateVehicle] = React.useState(false)

  // Flujo "Prender": al iniciarlo se pide la batería (introducir u omitir) en el modal.
  // Cuando el modal se cierra (guardó u omitió) se dispara la secuencia de encendido vía startSignal.
  const [pendingStart, setPendingStart] = React.useState(false)
  const [startSignal, setStartSignal] = React.useState(0)
  const handleBatteryOpenChange = React.useCallback(
    (open: boolean) => {
      setBatteryOpen(open)
      if (!open && pendingStart) {
        setPendingStart(false)
        setStartSignal((n) => n + 1)
      }
    },
    [pendingStart],
  )

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
                onViewingCreateChange={setViewingCreateVehicle}
                onPrenderRequest={() => {
                  setPendingStart(true)
                  setBatteryOpen(true)
                }}
                startSignal={startSignal}
              />
              <div className="no-scrollbar flex min-h-0 flex-col gap-4 md:overflow-y-auto">
                <AlertStack battery={state.battery ?? 0} />
                <ActionDock
                  nearest={nearest}
                  docsAlert={docsAlert}
                  battery={state.battery ?? 0}
                  disabled={viewingCreateVehicle}
                />
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
      <BatteryModal open={batteryOpen} onOpenChange={handleBatteryOpenChange} />
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
  onViewingCreateChange,
  onPrenderRequest,
  startSignal,
  className,
}: {
  vehicle: Vehicle
  vehicles: Vehicle[]
  activeIndex: number
  onSelectVehicle: (index: number) => void
  battery: number
  prefs: ReturnType<typeof useCumbreva>["state"]["preferences"]
  onBatteryClick: () => void
  onViewingCreateChange?: (viewingCreate: boolean) => void
  onPrenderRequest?: () => void
  startSignal?: number
  className?: string
}) {
  const autonomyKm = React.useMemo(
    () => realRange(vehicle, battery, currentConditions(prefs)).km,
    [vehicle, battery, prefs],
  )

  const hasMany = vehicles.length > 1

  // Carrusel: con varios vehículos se agrega un slot final para "Crear vehículo".
  const slots = hasMany ? vehicles.length + 1 : 1
  const [viewingCreate, setViewingCreate] = React.useState(false)
  const pos = viewingCreate ? vehicles.length : activeIndex
  const dragStart = React.useRef<{ x: number; y: number } | null>(null)
  const draggingRef = React.useRef(false)
  const [dragX, setDragX] = React.useState(0)
  const [isDragging, setIsDragging] = React.useState(false)

  // Carrusel tipo "mazo": las tarjetas se superponen. La del frente sigue al dedo y
  // las de atrás asoman escaladas a la derecha mostrando su borde (apilamiento). Se
  // mide el ancho del viewport para que las transformaciones sean proporcionales.
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const [viewportW, setViewportW] = React.useState(0)
  React.useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const update = () => setViewportW(el.clientWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  React.useEffect(() => {
    onViewingCreateChange?.(viewingCreate)
  }, [onViewingCreateChange, viewingCreate])

  function go(index: number) {
    const next = Math.max(0, Math.min(slots - 1, index))
    if (next >= vehicles.length) {
      setViewingCreate(true)
    } else {
      setViewingCreate(false)
      onSelectVehicle(next)
    }
  }

  // Pointer Events: funcionan con dedo (móvil), mouse y trackpad (escritorio).
  function handlePointerDown(event: React.PointerEvent<HTMLElement>) {
    if (!hasMany || running) return
    dragStart.current = { x: event.clientX, y: event.clientY }
    draggingRef.current = false
  }

  function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
    if (!hasMany || running || !dragStart.current) return
    const dx = event.clientX - dragStart.current.x
    const dy = event.clientY - dragStart.current.y

    // Distinguir entre tap/scroll vertical y arrastre horizontal antes de "enganchar".
    if (!draggingRef.current) {
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) {
        dragStart.current = null // es scroll vertical: soltamos el gesto
        return
      }
      if (Math.abs(dx) > 8) {
        draggingRef.current = true
        setIsDragging(true)
        try {
          event.currentTarget.setPointerCapture(event.pointerId)
        } catch {}
      } else {
        return
      }
    }

    // En los extremos del riel el arrastre opone resistencia (efecto elástico).
    const atStart = pos === 0 && dx > 0
    const atEnd = pos === slots - 1 && dx < 0
    setDragX(atStart || atEnd ? dx * 0.3 : dx)
  }

  function handlePointerUp(event: React.PointerEvent<HTMLElement>) {
    if (!dragStart.current) return
    const dx = event.clientX - dragStart.current.x
    const wasDragging = draggingRef.current
    dragStart.current = null
    draggingRef.current = false
    setIsDragging(false)
    setDragX(0)
    // Al soltar: si superó el umbral, avanza/retrocede un slot; si no, vuelve a su sitio.
    // (Si nunca se enganchó el arrastre, fue un tap: dejamos pasar el click.)
    if (!wasDragging) return
    if (Math.abs(dx) < 55) return
    go(dx < 0 ? pos + 1 : pos - 1)
  }

  // Puntos indicadores del carrusel (uno por slot, incluido el de "crear").
  function renderDots() {
    if (!hasMany || running) return null
    return (
      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
        {Array.from({ length: slots }).map((_, i) => {
          const active = i === pos
          return (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={i >= vehicles.length ? "Crear vehículo" : `Vehículo ${i + 1}`}
              className={cn("h-1.5 rounded-full transition-all", active ? "w-5 bg-primary" : "w-1.5 bg-foreground/30")}
            />
          )
        })}
      </div>
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

  // GPS real: mientras el vehículo está "prendido" se mide la distancia recorrida
  // (suma de tramos entre lecturas) y con ella se descuenta la autonomía consumida.
  const [tripKm, setTripKm] = React.useState(0)
  const lastPos = React.useRef<{ lat: number; lon: number } | null>(null)

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
    // Prender: primero se pide la batería (introducir u omitir) en el modal; al cerrarlo
    // el padre dispara la secuencia vía startSignal. Si no hay handler, arranca directo.
    if (onPrenderRequest) onPrenderRequest()
    else handlePrender()
  }

  // Arranque de la secuencia tras cerrar el modal de batería (guardó u omitió).
  React.useEffect(() => {
    if (!startSignal) return
    handlePrender()
    // Solo reacciona a cambios de startSignal; handlePrender se toma del scope actual.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startSignal])

  // Seguimiento por GPS mientras está prendido: acumula la distancia recorrida.
  // Usa el plugin nativo en Android y navigator.geolocation en web (ver lib/geolocation).
  React.useEffect(() => {
    if (!started) return
    lastPos.current = null
    setTripKm(0)
    const stop = watchPosition({
      onUpdate: (cur) => {
        if (lastPos.current) {
          const d = haversineKm(lastPos.current, cur)
          // Filtra ruido del GPS: ignora saltos < 3 m (jitter) y > 1 km (outliers).
          if (d > 0.003 && d < 1) setTripKm((k) => k + d)
        }
        lastPos.current = cur
      },
    })
    return stop
  }, [started])

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

  // Cara de una tarjeta de vehículo. El "prender" solo está activo en la tarjeta
  // centrada (isActive); las demás muestran sus valores reales de forma estática.
  function renderVehicleFace(v: Vehicle, isActive: boolean) {
    const faceSubtitle = [v.brand, v.model].filter(Boolean).join(" ")
    const faceTrip = tripStatus(battery)
    const faceBattery = isActive ? displayBattery : battery
    // En la tarjeta activa la autonomía mostrada descuenta lo consumido según el GPS.
    const faceAutonomy = isActive
      ? Math.max(displayAutonomy - Math.round(tripKm), 0)
      : realRange(v, battery, currentConditions(prefs)).km
    const faceStarted = isActive && started
    const faceRunning = isActive && running
    return (
      <div
        className={cn(
          "flex h-full flex-col overflow-hidden rounded-[24px] border bg-popover transition-colors",
          // Con mazo, la tarjeta del frente proyecta una sombra leve hacia la derecha,
          // sobre el borde de la tarjeta que asoma detrás.
          hasMany
            ? "shadow-[0_12px_28px_-18px_rgba(0,0,0,0.22),14px_0_22px_-14px_rgba(0,0,0,0.18)]"
            : "shadow-[0_12px_28px_-18px_rgba(0,0,0,0.22)]",
          faceStarted ? "border-primary/30 animate-cumbreva-halo-soft" : "border-border",
        )}
      >
        {/* Foto del vehículo: cubre toda la parte superior de la tarjeta. */}
        <div className="relative h-[162px] w-full overflow-hidden md:h-auto md:min-h-[205px] md:flex-[3]">
          <img
            src={v.photo || "/vehicle-byd-seagull-side-dark.jpg"}
            alt={v.name}
            draggable={false}
            className="h-full w-full select-none object-cover object-center"
          />

          {renderDots()}

          {/* Botón Prender / Apagar */}
          <button
            type="button"
            onClick={() => isActive && handleToggle()}
            disabled={faceRunning}
            aria-pressed={faceStarted}
            aria-label={faceStarted ? "Apagar vehículo" : "Prender vehículo"}
            className={cn(
              "absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold backdrop-blur-sm transition active:scale-95",
              faceStarted ? "bg-primary text-primary-foreground" : "bg-black/45 text-white",
            )}
          >
            <Power className="h-3.5 w-3.5" />
            {faceStarted ? "Apagar" : "Prender"}
          </button>

          {/* Secuencia de chequeo al prender */}
          {faceRunning && (
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
              <h1 className="truncate text-base font-bold leading-tight text-foreground">{v.name}</h1>
              {faceSubtitle && (
                <p className="mt-0.5 truncate text-[11px] font-medium text-foreground-muted">
                  {faceSubtitle}
                  {v.year ? ` · ${v.year}` : ""}
                </p>
              )}
            </div>
            <span
              className={cn(
                "flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold",
                faceTrip.tone === "ok" && "bg-primary/12 text-primary",
                faceTrip.tone === "warn" && "bg-warning/15 text-warning",
                faceTrip.tone === "risk" && "bg-destructive/12 text-destructive",
              )}
            >
              <faceTrip.Icon className="h-3 w-3" />
              {faceTrip.label}
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
                {faceBattery}%
                <Pencil className="h-3 w-3 text-primary" />
              </span>
            </button>

            <div className="flex flex-col items-start gap-1 border-l border-border pl-3">
              <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-foreground-muted">
                <Gauge className="h-3 w-3 text-primary" />
                Autonomía
              </span>
              <span className="text-xl font-semibold leading-none text-foreground">~{faceAutonomy} km</span>
            </div>
          </div>

          {/* Recorrido por GPS mientras está prendido: distancia y autonomía consumida. */}
          {faceStarted && (
            <p className="flex items-center gap-1.5 text-[10px] font-medium text-primary">
              <Navigation className="h-3 w-3 shrink-0" />
              {tripKm < 0.1
                ? "GPS activo · esperando señal…"
                : `${tripKm.toFixed(1)} km recorridos · −${Math.round(tripKm)} km autonomía`}
            </p>
          )}

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
      </div>
    )
  }

  // Cara final del riel: invitación a agregar otro vehículo.
  function renderCreateFace() {
    return (
      <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-border bg-popover shadow-[0_12px_28px_-18px_rgba(0,0,0,0.22),14px_0_22px_-14px_rgba(0,0,0,0.18)] transition-colors">
        <div className="relative flex h-[162px] w-full items-center justify-center overflow-hidden bg-muted/40 md:h-auto md:min-h-[205px] md:flex-[3]">
          {renderDots()}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(52,199,89,0.16),transparent_58%)]" />
          <div className="relative grid h-16 w-16 place-items-center rounded-full bg-primary/12 text-primary ring-1 ring-primary/20">
            <Plus className="h-8 w-8" />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 border-t border-border p-4 text-center md:flex-[2]">
          <div>
            <h1 className="text-base font-bold leading-tight text-foreground">Agregar otro vehiculo</h1>
            <p className="mt-0.5 text-[11px] font-medium text-foreground-muted">
              Suma un vehiculo a tu garaje
            </p>
          </div>
          <Link
            href="/vehiculo/nuevo"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[13px] font-semibold text-primary-foreground active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Crear vehiculo
          </Link>
        </div>
      </div>
    )
  }

  // Cara vacía: la tarjeta que asoma detrás está en blanco; se llena al pasar al frente.
  // Sin sombra (la sombra del frente basta) para que no quede una franja oscura cortada.
  function renderEmptyFace() {
    return (
      <div className="h-full w-full rounded-[24px] border border-border bg-popover" />
    )
  }

  return (
    <div className={cn("relative z-0 min-w-0", className)}>
      {/* Navegación accesible: botones ocultos para lectores de pantalla. */}
      {hasMany && !running && (
        <div className="sr-only" aria-label="Cambiar vehículo">
          <button type="button" onClick={() => go(pos - 1)} aria-label="Anterior" />
          <button type="button" onClick={() => go(pos + 1)} aria-label="Siguiente" />
        </div>
      )}
      {/* Viewport del mazo: recorta lo que sale por los lados (overflow-x-clip) y deja
          ver la sombra vertical de las tarjetas. */}
      <div
        ref={viewportRef}
        className={cn(
          // overflow-clip-margin deja respirar la sombra antes de recortar, así no
          // queda una línea dura en los bordes; lo que sale lejos sí se recorta.
          "relative h-full touch-pan-y select-none overflow-x-clip [overflow-clip-margin:44px]",
          hasMany && !running && (isDragging ? "cursor-grabbing" : "cursor-grab"),
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {(() => {
          // Gutter derecho: hueco donde asoma la tarjeta apilada detrás. Pequeño para
          // que la tarjeta del frente llegue casi a ambos márgenes.
          // El gutter NO depende de "running": al prender la tarjeta debe conservar el
          // mismo tamaño y posición (solo se bloquea el arrastre y se muestra la carga encima).
          const GUTTER = hasMany ? 18 : 0
          const W = viewportW || 320
          const S = Math.max(W - GUTTER, 1) // ancho real de la tarjeta del frente
          const pNext = Math.min(Math.max(-dragX, 0) / S, 1) // progreso arrastrando a la izquierda
          const pPrev = Math.min(Math.max(dragX, 0) / S, 1) // progreso arrastrando a la derecha
          // Renderiza la del frente (con contenido) + UNA atrás vacía (asoma a la derecha)
          // + la anterior vacía (oculta, entra al arrastrar a la derecha).
          const ks = hasMany ? [-1, 0, 1] : [0]
          return ks
            .map((k) => ({ k, i: pos + k }))
            .filter(({ i }) => i >= 0 && i <= slots - 1)
            .map(({ k, i }) => {
              const isCreate = i >= vehicles.length
              const isFront = k === 0

              let transform: string
              let zIndex: number
              let opacity = 1
              if (isFront) {
                // El frente queda pegado a la izquierda; el hueco (gutter) queda a la derecha.
                transform = `translateX(${dragX}px) rotate(${dragX * 0.012}deg)`
                zIndex = 30
              } else if (k > 0) {
                // La de atrás (vacía): asoma a la DERECHA mostrando su borde y se acerca al centro al arrastrar.
                const d = Math.max(k - pNext, 0)
                const scale = Math.max(1 - 0.05 * d, 0.85)
                const offX = (S * (1 - scale)) / 2 + 11 * d
                transform = `translateX(${offX}px) translateY(${6 * d}px) scale(${scale})`
                zIndex = Math.round(30 - d * 8)
              } else {
                // Anterior (vacía): fuera de pantalla a la izquierda en reposo; entra
                // deslizándose al arrastrar a la derecha (y es a donde sale la que se descarta).
                const scale = 0.9 + 0.1 * pPrev
                const offX = -S * (1 - pPrev)
                transform = `translateX(${offX}px) scale(${scale})`
                zIndex = 35 // entra por encima de la del frente
                opacity = pPrev
              }

              return (
                <div
                  key={isCreate ? "create" : vehicles[i].id}
                  aria-hidden={!isFront}
                  className={cn(
                    "will-change-transform",
                    isFront ? "relative h-full" : "pointer-events-none absolute inset-y-0 left-0",
                    isDragging ? "transition-none" : "transition-[transform,opacity] duration-300 ease-out",
                  )}
                  style={{
                    width: `calc(100% - ${GUTTER}px)`,
                    transform,
                    zIndex,
                    opacity,
                  }}
                >
                  {/* Solo la del frente muestra contenido; las de atrás van vacías. */}
                  {!isFront
                    ? renderEmptyFace()
                    : isCreate
                      ? renderCreateFace()
                      : renderVehicleFace(vehicles[i], !viewingCreate && i === activeIndex)}
                </div>
              )
            })
        })()}
      </div>
    </div>
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

/** Distancia en km entre dos coordenadas (fórmula de Haversine). */
function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371 // radio terrestre en km
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
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

type AlertItem = {
  id: string
  tone: "warn" | "risk"
  Icon: typeof TriangleAlert
  eyebrow: string
  title: string
  detail?: string
  href?: string
}

/** Apilado (mazo) de alertas: documentos pendientes + recomendaciones.
 *  Solo se ve la del frente; las de atrás asoman por arriba (borde de apilamiento).
 *  Cada una se cierra con su X y deja ver la siguiente. */
function AlertStack({ battery }: { battery: number }) {
  const items = React.useMemo<AlertItem[]>(() => {
    const rank: Record<string, number> = { vencido: 0, "por-vencer": 1, "no-cargado": 2 }
    const docs = documentTemplates
      .filter((d) => d.status === "por-vencer" || d.status === "vencido" || d.status === "no-cargado")
      .sort((a, b) => (rank[a.status] ?? 9) - (rank[b.status] ?? 9))
      .map<AlertItem>((d) => ({
        id: `doc-${d.id}`,
        tone: d.status === "vencido" ? "risk" : "warn",
        Icon: TriangleAlert,
        eyebrow:
          d.status === "vencido"
            ? "Documento vencido"
            : d.status === "no-cargado"
              ? "Documento sin cargar"
              : "Documento por vencer",
        title: d.name,
        detail:
          d.status === "vencido"
            ? "Requiere atención inmediata."
            : d.status === "no-cargado"
              ? "Aún no lo has cargado."
              : "Está por vencer pronto.",
        href: "/documentos",
      }))

    const trip = tripStatus(battery)
    const reco: AlertItem[] =
      trip.tone === "ok"
        ? []
        : [
            {
              id: "reco-bateria",
              tone: trip.tone === "risk" ? "risk" : "warn",
              Icon: trip.Icon,
              eyebrow: `Recomendación · ${trip.label}`,
              title: trip.copilot,
            },
          ]

    return [...docs, ...reco]
  }, [battery])

  const [dismissed, setDismissed] = React.useState<string[]>([])
  const visible = items.filter((i) => !dismissed.includes(i.id))
  if (visible.length === 0) return null

  const front = visible[0]
  const behind = Math.min(visible.length - 1, 1) // máx 1 carta asomando atrás

  return (
    <div className="relative">
      {/* Cartas de atrás: asoman por arriba como borde de apilamiento. */}
      {Array.from({ length: behind }).map((_, idx) => {
        const depth = behind - idx // la más lejana primero (2), luego 1
        const layerItem = visible[depth]
        return (
          <div
            key={layerItem?.id ?? `layer-${depth}`}
            aria-hidden="true"
            className={cn(
              "absolute bottom-0 rounded-2xl border bg-popover shadow-[0_6px_16px_-12px_rgba(0,0,0,0.28)] transition-all",
              (layerItem?.tone ?? front.tone) === "risk" ? "border-destructive/25" : "border-warning/25",
            )}
            style={{
              top: -depth * 4,
              left: depth * 9,
              right: depth * 9,
              opacity: 1 - depth * 0.16,
            }}
          />
        )
      })}
      {/* Carta del frente. */}
      <AlertCard
        item={front}
        remaining={visible.length}
        onDismiss={() => setDismissed((d) => [...d, front.id])}
      />
    </div>
  )
}

function AlertCard({
  item,
  remaining,
  onDismiss,
}: {
  item: AlertItem
  remaining: number
  onDismiss: () => void
}) {
  const body = (
    <>
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-foreground-muted">
        {item.eyebrow}
        {remaining > 1 && (
          <span className="rounded-full bg-foreground/10 px-1.5 py-0.5 text-[9px] font-bold leading-none text-foreground-muted">
            +{remaining - 1}
          </span>
        )}
      </p>
      <p className="mt-0.5 text-[13px] font-medium leading-snug text-foreground">{item.title}</p>
      {item.detail && (
        <p className="mt-1 truncate text-[10px] font-medium text-foreground-muted">{item.detail}</p>
      )}
    </>
  )
  return (
    <div
      role="status"
      className={cn(
        "relative z-10 flex items-start gap-3 rounded-2xl border bg-popover p-3.5 shadow-[0_10px_24px_-18px_rgba(0,0,0,0.35)]",
        item.tone === "risk" ? "border-destructive/30" : "border-warning/30",
      )}
    >
      <span
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-full",
          item.tone === "risk" ? "bg-destructive/12 text-destructive" : "bg-warning/15 text-warning",
        )}
      >
        <item.Icon className="h-4 w-4" />
      </span>
      {item.href ? (
        <Link href={item.href} className="min-w-0 flex-1">
          {body}
        </Link>
      ) : (
        <div className="min-w-0 flex-1">{body}</div>
      )}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Descartar"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-foreground-muted active:bg-overlay-hover"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

function ActionDock({
  nearest,
  docsAlert,
  battery,
  disabled = false,
}: {
  nearest?: (typeof chargers)[number]
  docsAlert?: boolean
  battery: number
  disabled?: boolean
}) {
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
        <Package className={cn("h-3.5 w-3.5", disabled ? "text-foreground-muted" : "text-foreground")} />
        <p id="ecosystem-title" className={cn("text-xs font-semibold", disabled ? "text-foreground-muted" : "text-foreground")}>
          Todo a mano
        </p>
      </div>
      <div className="grid grid-cols-3 gap-x-2 gap-y-4">
        {items.map(({ href, label, icon: Icon, bg, fg, alert }) => (
          <Link
            key={label}
            href={href}
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : undefined}
            onClick={(event) => {
              if (disabled) event.preventDefault()
            }}
            className={cn(
              "flex flex-col items-center gap-1.5 text-center active:scale-[0.97]",
              disabled && "cursor-default grayscale",
            )}
          >
            <span
              className="relative grid h-12 w-12 place-items-center rounded-full"
              style={{ backgroundColor: disabled ? "rgba(148,163,184,0.16)" : bg, color: disabled ? "rgba(100,116,139,0.72)" : fg }}
            >
              <Icon className="h-5 w-5" strokeWidth={1.9} />
              {alert && !disabled && (
                <span
                  className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-card bg-destructive"
                  aria-label="Tiene pendientes"
                />
              )}
            </span>
            <span className={cn("text-[11px] font-medium leading-tight", disabled ? "text-foreground-soft" : "text-foreground-muted")}>
              {label}
            </span>
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
