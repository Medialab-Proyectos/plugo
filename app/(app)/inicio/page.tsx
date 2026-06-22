"use client"

import * as React from "react"
import Link from "next/link"
import {
  BatteryCharging,
  Bell,
  CalendarClock,
  CarFront,
  CircleHelp,
  Gauge,
  MapPinned,
  Navigation,
  Route,
  ShieldCheck,
  TriangleAlert,
  Wrench,
  X,
} from "lucide-react"
import { BatteryModal } from "@/components/battery-modal"
import { ThemeToggle } from "@/components/theme-toggle"
import { chargers } from "@/lib/mock-data"
import { compatibility, rankChargers } from "@/lib/decision"
import { realRange, currentConditions } from "@/lib/autonomy"
import { useCumbreva, type Vehicle } from "@/lib/cumbreva-context"
import { CumbrevaLogo } from "@/components/cumbreva-logo"
import { cn } from "@/lib/utils"

export default function InicioPage() {
  const { state } = useCumbreva()
  const [batteryOpen, setBatteryOpen] = React.useState(false)

  const compatibleChargers = React.useMemo(
    () => chargers.filter((charger) => compatibility(charger, state.vehicle).compatible),
    [state.vehicle],
  )
  const ranked = React.useMemo(() => rankChargers(compatibleChargers, state.vehicle), [compatibleChargers, state.vehicle])
  const nearest = ranked.primary ?? ranked.fallback ?? ranked.rest[0]

  return (
    <>
      {/* Web app responsive: en desktop el contenido usa el ancho en 2 columnas,
          en móvil se apila. Scroll del documento, sin marco de celular. */}
      <main className="w-full bg-background text-foreground md:flex md:h-dvh md:flex-col md:overflow-hidden">
        <CorporateHeader userName={state.userName} />

        <div className="mx-auto w-full max-w-[1120px] px-4 pt-4 sm:px-6 md:flex-1 md:overflow-hidden md:px-8 md:pb-6">
          {state.vehicle ? (
            <div className="grid gap-4 md:h-full md:grid-cols-[1.3fr_1fr] md:items-stretch">
              <SmartRouteHero
                className="md:h-full"
                vehicle={state.vehicle}
                battery={state.battery ?? 0}
                prefs={state.preferences}
                onBatteryClick={() => setBatteryOpen(true)}
              />
              <div className="no-scrollbar flex min-h-0 flex-col gap-4 md:overflow-y-auto">
                <RecommendationPush battery={state.battery ?? 0} />
                <ActionDock nearest={nearest} />
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
  battery,
  prefs,
  onBatteryClick,
  className,
}: {
  vehicle: Vehicle
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

  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_24px_60px_-36px_rgba(0,0,0,0.5)]",
        className,
      )}
    >
      {/* Foto del vehículo: fija, como fondo que cubre toda la parte superior de la tarjeta. */}
      <div className="relative h-[200px] w-full overflow-hidden md:h-auto md:min-h-[220px] md:flex-[3]">
        <img
          src={vehicle.photo || "/vehicle-byd-seagull-side-dark.jpg"}
          alt={vehicle.name}
          className="h-full w-full object-cover object-center"
        />
      </div>

      {/* Sector de información (~40%): compacto, organizado y accesible. */}
      <div className="flex flex-col gap-2.5 border-t border-border p-4 md:flex-[2] md:justify-center">
        {/* Nombre + estado */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="min-w-0 truncate text-base font-bold leading-tight text-foreground">{vehicle.name}</h1>
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
            className="flex flex-col items-start gap-1 text-left active:opacity-70"
          >
            <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-foreground-muted">
              <BatteryCharging className="h-3 w-3 text-primary" />
              Batería
            </span>
            <span className="text-xl font-semibold leading-none text-foreground">{battery}%</span>
          </button>

          <div className="flex flex-col items-start gap-1 border-l border-border pl-3">
            <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-foreground-muted">
              <Gauge className="h-3 w-3 text-primary" />
              Autonomía
            </span>
            <span className="text-xl font-semibold leading-none text-foreground">~{autonomyKm} km</span>
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
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background/40 text-[13px] font-semibold text-foreground active:scale-[0.98]"
          >
            <MapPinned className="h-4 w-4 text-primary" />
            Cargar
          </Link>
        </div>
      </div>
    </section>
  )

  function nearestHref() {
    return "/mapa"
  }
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
      label: "Viaje seguro",
      copilot: "Con tu batería actual puedes moverte con confianza.",
      Icon: ShieldCheck,
    }
  }
  if (battery >= 25) {
    return {
      tone: "warn",
      label: "Carga recomendada",
      copilot: "Te alcanza para hoy, pero considera una carga corta antes de un viaje largo.",
      Icon: TriangleAlert,
    }
  }
  return {
    tone: "risk",
    label: "Revisa tu batería",
    copilot: "Te recomendamos cargar antes de continuar para viajar con tranquilidad.",
    Icon: TriangleAlert,
  }
}

/** Recomendación como notificación push: se puede descartar con la X. */
function RecommendationPush({ battery }: { battery: number }) {
  const trip = tripStatus(battery)
  const [dismissed, setDismissed] = React.useState(false)
  if (dismissed) return null
  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 rounded-2xl border bg-card p-3.5 shadow-[0_12px_30px_-20px_rgba(0,0,0,0.5)]",
        trip.tone === "ok" && "border-primary/25",
        trip.tone === "warn" && "border-warning/30",
        trip.tone === "risk" && "border-destructive/30",
      )}
    >
      <span
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-full",
          trip.tone === "ok" && "bg-primary/12 text-primary",
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

function ActionDock({ nearest }: { nearest?: (typeof chargers)[number] }) {
  const items = [
    { href: "/mi-vehiculo", label: "Vehículo", icon: CarFront, bg: "#5856d61a", fg: "#5856d6" },
    { href: "/servicios", label: "Servicios", icon: Wrench, bg: "#007aff1a", fg: "#007aff" },
    { href: "/documentos", label: "Auto Vault", icon: ShieldCheck, bg: "#ff2d551a", fg: "#ff2d55" },
    { href: "/perfil/recompensas", label: "Beneficios", icon: CalendarClock, bg: "#ffcc001a", fg: "#b58900" },
    { href: nearest ? `/cargador/${nearest.id}` : "/mapa", label: "Electrolineras", icon: Navigation, bg: "#007aff1a", fg: "#007aff" },
    { href: "/mapa", label: "Mapa", icon: MapPinned, bg: "#00c7be1a", fg: "#00a59e" },
  ]

  return (
    <section aria-labelledby="ecosystem-title">
      <p id="ecosystem-title" className="mb-3 text-xs font-medium text-foreground-muted">
        Todo a mano
      </p>
      <div className="grid grid-cols-3 gap-x-2 gap-y-4">
        {items.map(({ href, label, icon: Icon, bg, fg }) => (
          <Link
            key={label}
            href={href}
            className="flex flex-col items-center gap-1.5 text-center active:scale-[0.97]"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl" style={{ backgroundColor: bg, color: fg }}>
              <Icon className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <span className="text-[11px] font-medium leading-tight text-foreground-muted">{label}</span>
          </Link>
        ))}
      </div>
    </section>
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
