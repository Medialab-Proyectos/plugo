"use client"

import * as React from "react"
import Link from "next/link"
import {
  BatteryCharging,
  Bell,
  CalendarClock,
  CarFront,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  FolderOpen,
  MapPinned,
  Mountain,
  Navigation,
  Route,
  Sparkles,
  TriangleAlert,
  Wrench,
} from "lucide-react"
import { BatteryModal } from "@/components/battery-modal"
import { PlugoLogo } from "@/components/plugo-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { chargers, documentTemplates } from "@/lib/mock-data"
import { compatibility, rankChargers } from "@/lib/decision"
import { usePlugo, type Vehicle } from "@/lib/plugo-context"
import { cn } from "@/lib/utils"

const headerGradient = "linear-gradient(10deg, #003833 0%, #00bea0 100%)"
const heroGradient = "radial-gradient(circle at 48% 32%, rgba(146,255,231,0.35), transparent 34%), radial-gradient(circle at 84% 70%, rgba(0,122,255,0.18), transparent 28%), linear-gradient(145deg, #001f1c 0%, #00584d 58%, #00bea0 100%)"

export default function InicioPage() {
  const { state } = usePlugo()
  const [batteryOpen, setBatteryOpen] = React.useState(false)

  const compatibleChargers = React.useMemo(
    () => chargers.filter((charger) => compatibility(charger, state.vehicle).compatible),
    [state.vehicle],
  )
  const ranked = React.useMemo(() => rankChargers(compatibleChargers, state.vehicle), [compatibleChargers, state.vehicle])
  const nearest = ranked.primary ?? ranked.fallback ?? ranked.rest[0]
  const pendingDocs = documentTemplates.filter((doc) => doc.status === "por-vencer" || doc.status === "vencido" || doc.status === "no-cargado")

  return (
    <>
      <main className="flex h-full min-h-0 flex-col overflow-hidden bg-background text-foreground">
        <CorporateHeader />

        <div className="mx-auto flex min-h-0 w-full max-w-[480px] flex-1 flex-col justify-center gap-3 px-4 py-3">
          {state.vehicle ? (
            <SmartRouteHero
              vehicle={state.vehicle}
              battery={state.battery ?? 0}
              nearest={nearest}
              pendingDocs={pendingDocs.length}
              onBatteryClick={() => setBatteryOpen(true)}
            />
          ) : (
            <EmptyStateCard />
          )}

          <CoreActions nearest={nearest} pendingDocs={pendingDocs.length} />
          <ActionDock nearest={nearest} />
        </div>
      </main>
      <BatteryModal open={batteryOpen} onOpenChange={setBatteryOpen} />
    </>
  )
}

function CorporateHeader() {
  return (
    <header className="shrink-0 rounded-b-2xl px-5 pb-3 pt-[max(env(safe-area-inset-top),0.75rem)] text-white" style={{ background: headerGradient }}>
      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-2">
        <div className="flex min-h-[44px] items-center justify-between">
          <PlugoLogo className="[&>span]:text-white [&>div]:h-8 [&>div]:w-8 [&>div]:rounded-lg [&>div]:shadow-none" size="lg" />
          <div className="flex items-center gap-2">
            <ThemeToggle className="bg-white/10 text-white hover:bg-white/15" />
            <button aria-label="Ayuda" className="grid h-10 w-10 place-items-center rounded-full text-white/95 active:bg-white/10">
              <CircleHelp className="h-5 w-5" />
            </button>
            <button aria-label="Notificaciones" className="grid h-10 w-10 place-items-center rounded-full text-white/95 active:bg-white/10">
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

function SmartRouteHero({
  vehicle,
  battery,
  nearest,
  pendingDocs,
  onBatteryClick,
}: {
  vehicle: Vehicle
  battery: number
  nearest?: (typeof chargers)[number]
  pendingDocs: number
  onBatteryClick: () => void
}) {
  const routeConfidence = Math.min(99, Math.max(82, battery + 45 - pendingDocs * 4))

  return (
    <section className="relative shrink-0 overflow-hidden rounded-[24px] p-4 text-white shadow-[0_24px_58px_-34px_rgba(0,56,51,0.9)]" style={{ background: heroGradient }}>
      <style>{`
        @keyframes plugoFlow {
          0%, 100% { transform: translateX(-12%) translateY(8px) rotate(-3deg); opacity: .18; }
          50% { transform: translateX(12%) translateY(-8px) rotate(3deg); opacity: .42; }
        }
        @keyframes plugoPulseSoft {
          0%, 100% { transform: scale(.96); opacity: .32; }
          50% { transform: scale(1.06); opacity: .66; }
        }
      `}</style>
      <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:30px_30px]" />
      <div className="absolute -left-20 top-8 h-56 w-56 rounded-full bg-[#92ffe7]/35 blur-3xl" style={{ animation: "plugoPulseSoft 4.8s ease-in-out infinite" }} />
      <div className="absolute left-[-25%] top-[43%] h-20 w-[150%] rounded-[100%] bg-[linear-gradient(90deg,transparent,rgba(146,255,231,0.36),rgba(0,122,255,0.18),transparent)] blur-xl" style={{ animation: "plugoFlow 5.4s ease-in-out infinite" }} />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-xs font-semibold text-[#92ffe7]">
            <Sparkles className="h-3.5 w-3.5 fill-current" />
            Calculado para tu {vehicle.brand}
          </p>
          <h1 className="mt-1 max-w-[11ch] text-[30px] font-black leading-[1.02]">Viaja sin ansiedad</h1>
        </div>
        <div className="shrink-0 rounded-2xl border border-white/18 bg-white/12 px-3 py-2 text-right backdrop-blur">
          <p className="text-lg font-black leading-none text-[#92ffe7]">{routeConfidence}%</p>
          <p className="mt-0.5 text-[9px] font-semibold uppercase leading-none tracking-wide text-white/68">confiable</p>
        </div>
      </div>

      <div className="relative z-10 h-[128px]">
        <div className="absolute left-0 top-4 rounded-full bg-black/18 px-2.5 py-1 text-[10px] font-bold text-[#92ffe7] backdrop-blur">
          {nearest ? `${nearest.distanceKm.toFixed(1)} km a carga` : "Mapa listo"}
        </div>
        <div className="absolute bottom-2 left-7 right-7 h-10 rounded-full bg-black/30 blur-xl" />
        <img
          src={vehicle.photo || "/vehicle-byd-seagull-side-dark.jpg"}
          alt={vehicle.name}
          className="absolute bottom-0 left-1/2 h-[126px] w-[318px] -translate-x-1/2 object-contain drop-shadow-[0_22px_18px_rgba(0,0,0,0.36)]"
        />
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-2">
        <Link href="/rutas" className="flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-3 text-sm font-black text-[#003833] active:scale-[0.98]">
          <Route className="h-4 w-4" />
          Planear ruta
        </Link>
        <Link href={nearest ? `/cargador/${nearest.id}` : "/mapa"} className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/18 bg-white/12 px-3 text-sm font-black text-white active:scale-[0.98]">
          <MapPinned className="h-5 w-5 text-[#92ffe7]" />
          Cargar
        </Link>
      </div>

      <button
        type="button"
        onClick={onBatteryClick}
        className="relative z-10 mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-black/16 text-xs font-bold text-white/82 active:scale-[0.99]"
      >
        <BatteryCharging className="h-4 w-4 text-[#92ffe7]" />
        {battery}% bateria · relieve incluido
      </button>
    </section>
  )
}

function CoreActions({ nearest, pendingDocs }: { nearest?: (typeof chargers)[number]; pendingDocs: number }) {
  const hasPending = pendingDocs > 0

  return (
    <section className="grid shrink-0 grid-cols-3 gap-2">
      <Link href="/rutas" className="rounded-2xl border border-border bg-card p-3 text-card-foreground shadow-[0_10px_28px_-26px_rgba(0,0,0,0.5)] active:scale-[0.99]">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e6fbf7] text-[#007f6d]">
          <Mountain className="h-4 w-4" />
        </span>
        <p className="mt-2 text-[11px] font-black leading-3">Topografia</p>
        <p className="mt-0.5 text-[9px] leading-3 text-foreground-muted">en ruta</p>
      </Link>

      <Link href={nearest ? `/cargador/${nearest.id}` : "/mapa"} className="rounded-2xl border border-border bg-card p-3 text-card-foreground shadow-[0_10px_28px_-26px_rgba(0,0,0,0.5)] active:scale-[0.99]">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e8f1ff] text-[#007aff]">
          <Navigation className="h-4 w-4" />
        </span>
        <p className="mt-2 text-[11px] font-black leading-3">Electrolinera</p>
        <p className="mt-0.5 text-[9px] leading-3 text-foreground-muted">{nearest ? `${nearest.distanceKm.toFixed(1)} km` : "mapa vivo"}</p>
      </Link>

      <Link href="/documentos" className="rounded-2xl border border-border bg-card p-3 text-card-foreground shadow-[0_10px_28px_-26px_rgba(0,0,0,0.5)] active:scale-[0.99]">
        <span className={cn("grid h-9 w-9 place-items-center rounded-xl", hasPending ? "bg-[#fff4d8] text-[#a67502]" : "bg-[#e9fbf2] text-[#18631d]")}>
          {hasPending ? <TriangleAlert className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
        </span>
        <p className="mt-2 text-[11px] font-black leading-3">Guantera</p>
        <p className="mt-0.5 text-[9px] leading-3 text-foreground-muted">{hasPending ? "pendiente" : "lista"}</p>
      </Link>
    </section>
  )
}

function ActionDock({ nearest }: { nearest?: (typeof chargers)[number] }) {
  const items = [
    { href: "/rutas", label: "Ruta", icon: Route, bg: "#00c7be1a", fg: "#00a59e" },
    { href: nearest ? `/cargador/${nearest.id}` : "/mapa", label: "Carga", icon: BatteryCharging, bg: "#007aff1a", fg: "#007aff" },
    { href: "/documentos", label: "Guantera", icon: FolderOpen, bg: "#ff2d551a", fg: "#ff2d55" },
    { href: "/servicios", label: "Servicios", icon: Wrench, bg: "#007aff1a", fg: "#007aff" },
    { href: "/mi-vehiculo", label: "Vehiculo", icon: CarFront, bg: "#5856d61a", fg: "#5856d6" },
    { href: "/perfil/recompensas", label: "Beneficios", icon: CalendarClock, bg: "#ffcc001a", fg: "#b58900" },
  ]

  return (
    <section className="shrink-0 space-y-2 overflow-hidden" aria-labelledby="ecosystem-title">
      <div className="flex items-center justify-between">
        <p id="ecosystem-title" className="text-xs leading-none text-foreground-muted">
          Todo a mano
        </p>
        <Link href="/mi-vehiculo" className="flex items-center gap-0.5 text-xs font-semibold text-[#007f6d]">
          Ver vehiculo <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-x-3 gap-y-2">
        {items.map(({ href, label, icon: Icon, bg, fg }) => (
          <Link key={href} href={href} className="flex h-[64px] flex-col items-center justify-center gap-1 rounded-2xl bg-card p-1 text-center text-card-foreground shadow-[0_10px_28px_-26px_rgba(0,0,0,0.55)] active:scale-[0.97]">
            <span className="grid h-8 w-8 place-items-center rounded-xl" style={{ backgroundColor: bg, color: fg }}>
              <Icon className="h-5 w-5" strokeWidth={1.9} />
            </span>
            <span className="text-[11px] leading-3">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

function EmptyStateCard() {
  return (
    <Link href="/vehiculo/nuevo" className="flex h-[360px] items-center justify-center rounded-2xl border border-dashed border-[#cddbd6] bg-white text-sm font-semibold text-[#007f6d]">
      Registrar vehiculo
    </Link>
  )
}
