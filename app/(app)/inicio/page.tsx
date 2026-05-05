"use client"

import * as React from "react"
import Link from "next/link"
import {
  BatteryCharging,
  Bell,
  BriefcaseBusiness,
  ChevronDown,
  ChevronRight,
  Clock3,
  Flame,
  MapPin,
  Navigation,
  PencilLine,
  Route,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  TrendingDown,
  Zap,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BatteryModal } from "@/components/battery-modal"
import { chargers, formatCOP } from "@/lib/mock-data"
import { batteryAtArrival, chargerProbability, compatibility, estimatedMinutes, rankChargers } from "@/lib/decision"
import { usePlugo, type Vehicle } from "@/lib/plugo-context"

const accent = "#00b85c"
const softGreen = "#00b85c"

/* ─── Contextual greeting by time of day ─── */
function getGreeting(): { text: string; emoji: string } {
  const h = new Date().getHours()
  if (h < 6) return { text: "Buenas noches", emoji: "🌙" }
  if (h < 12) return { text: "Buenos días", emoji: "☀️" }
  if (h < 18) return { text: "Buenas tardes", emoji: "🌤️" }
  return { text: "Buenas noches", emoji: "🌙" }
}

/* ─── Battery color by level ─── */
function batteryColor(level: number): string {
  if (level > 35) return "#00b85c"
  if (level > 15) return "#d9a000"
  return "#e05055"
}

function batteryLabel(level: number): { text: string; color: string } {
  if (level > 35) return { text: "Todo bajo control", color: "#369C34" }
  if (level > 15) return { text: "Podrías necesitar cargar pronto", color: "#ffb000" }
  return { text: "Te recomendamos cargar ya", color: "#ff5a5f" }
}

export default function InicioPage() {
  const { state } = usePlugo()
  const [batteryOpen, setBatteryOpen] = React.useState(false)

  const compatibleChargers = React.useMemo(
    () => chargers.filter((charger) => compatibility(charger, state.vehicle).compatible),
    [state.vehicle],
  )
  const ranked = React.useMemo(
    () => rankChargers(compatibleChargers, state.vehicle),
    [compatibleChargers, state.vehicle],
  )
  const rankedChargers = React.useMemo(() => {
    const list = []
    if (ranked.primary) list.push(ranked.primary)
    if (ranked.fallback) list.push(ranked.fallback)
    list.push(...ranked.rest)
    return list.slice(0, 5)
  }, [ranked])

  return (
    <>
      <main className="relative flex flex-1 flex-col bg-background px-5 pt-8 pb-6 font-sans text-foreground">

        <div className="relative z-10 mx-auto flex w-full max-w-[430px] flex-1 flex-col gap-5">
          <HomeHeader />

          <div className="flex min-h-0 flex-1 flex-col gap-5">
            {state.vehicles.length > 0 ? (
              <VehicleCarousel onUpdateBattery={() => setBatteryOpen(true)} />
            ) : (
              <EmptyVehicleCard />
            )}
            {rankedChargers.length > 0 ? (
              <ChargerCarousel chargers={rankedChargers} />
            ) : (
              <NoChargerCard />
            )}
            <QuickAccess />
          </div>
        </div>
      </main>
      <BatteryModal open={batteryOpen} onOpenChange={setBatteryOpen} />
    </>
  )
}

/* ─── Header ─── */
function HomeHeader() {
  const { state } = usePlugo()
  const firstName = (state.userName || "Camilo").split(" ")[0]
  const greeting = getGreeting()

  return (
    <header className="flex shrink-0 items-start justify-between gap-1">
      <div className="min-w-0 flex-1">
        <h1 className="whitespace-nowrap text-[clamp(22px,6vw,28px)] font-semibold leading-none tracking-tight">
          Hola, <span style={{ color: accent }}>{firstName}</span>
        </h1>
        <button type="button" className="mt-1.5 flex items-center gap-1 text-[clamp(11px,3.2vw,14px)] font-normal text-white/80">
          <MapPin className="h-3 w-3 shrink-0" style={{ color: accent }} />
          <span>Bogotá, Colombia</span>
          <ChevronDown className="h-3 w-3 shrink-0 text-white/60" />
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {/* PlugoCoins + Streak combined badge */}
        <Link
          href="/perfil/recompensas"
          className="flex h-[30px] items-center gap-1 rounded-full border border-white/12 bg-[#040C0F] px-1.5 backdrop-blur-xl"
        >
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#d4b01a] text-black">
            <Zap className="h-2.5 w-2.5 fill-black" />
          </span>
          <span className="text-[11px] font-semibold tabular-nums">{state.plugoCoins.toLocaleString("es-CO")}</span>
          {state.streakDays > 0 && (
            <span className="flex items-center gap-0.5 border-l border-white/15 pl-1">
              <Flame className="h-3 w-3 text-[#d45a2c]" />
              <span className="text-[10px] font-semibold text-[#d45a2c]">{state.streakDays}</span>
            </span>
          )}
        </Link>

        <button
          type="button"
          aria-label="Notificaciones"
          className="relative flex h-[32px] w-[32px] items-center justify-center rounded-full border border-white/12 bg-white/[0.02] backdrop-blur-xl"
        >
          <Bell className="h-4 w-4 text-white/90" />
          <span className="absolute -right-0.5 -top-0.5 flex h-[14px] w-[14px] items-center justify-center rounded-full bg-[#e05055] text-[7px] font-semibold text-white">3</span>
        </button>
      </div>
    </header>
  )
}

/* ─── Swipe hook shared by both carousels ─── */
function useSwipe(count: number, initial = 0) {
  const [index, setIndex] = React.useState(initial)
  const [offsetX, setOffsetX] = React.useState(0)
  const [swiping, setSwiping] = React.useState(false)
  const startX = React.useRef(0)

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    setSwiping(true)
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (!swiping) return
    setOffsetX(e.touches[0].clientX - startX.current)
  }
  const onTouchEnd = () => {
    setSwiping(false)
    const threshold = 50
    if (offsetX < -threshold && index < count - 1) setIndex(index + 1)
    else if (offsetX > threshold && index > 0) setIndex(index - 1)
    setOffsetX(0)
  }

  return { index, setIndex, offsetX: swiping ? offsetX : 0, handlers: { onTouchStart, onTouchMove, onTouchEnd } }
}

/* ─── Vehicle Carousel ─── */
function VehicleCarousel({ onUpdateBattery }: { onUpdateBattery: () => void }) {
  const { state, dispatch } = usePlugo()
  const { index, offsetX, handlers } = useSwipe(state.vehicles.length, state.activeVehicleIndex)

  React.useEffect(() => {
    dispatch({ type: "SET_ACTIVE_VEHICLE", index })
  }, [index, dispatch])

  return (
    <div className="overflow-hidden" {...handlers}>
      <div
        className="flex transition-transform duration-300 ease-out"
        style={{ transform: `translateX(calc(-${index * 100}% + ${offsetX}px))` }}
      >
        {state.vehicles.map((v, i) => (
          <div key={v.id} className="w-full shrink-0">
            <VehicleCard
              vehicle={v}
              index={i}
              total={state.vehicles.length}
              onUpdateBattery={onUpdateBattery}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Charger Carousel ─── */
function ChargerCarousel({ chargers: list }: { chargers: (typeof chargers)[number][] }) {
  const { index, offsetX, handlers } = useSwipe(list.length)

  return (
    <div className="overflow-hidden" {...handlers}>
      <div
        className="flex transition-transform duration-300 ease-out"
        style={{ transform: `translateX(calc(-${index * 100}% + ${offsetX}px))` }}
      >
        {list.map((c, i) => (
          <div key={c.id} className="w-full shrink-0">
            <ChargingCard charger={c} index={i} total={list.length} />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Vehicle Card with dynamic battery states ─── */
function VehicleCard({ vehicle, index, total, onUpdateBattery }: { vehicle: Vehicle; index: number; total: number; onUpdateBattery: () => void }) {
  const { state } = usePlugo()
  const battery = state.battery ?? 42
  const bColor = batteryColor(battery)
  const bLabel = batteryLabel(battery)
  const isLow = battery <= 25

  return (
    <section
      className="home-card relative overflow-hidden rounded-[20px] border border-white/[0.07] bg-[#040C0F]"
      style={{ padding: "clamp(10px, 1.6vh, 16px) 14px" }}
    >
      <div className="relative z-10">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-[clamp(17px,4.8vw,21px)] font-semibold leading-tight">{vehicle.name || `${vehicle.brand} ${vehicle.model}`}</h2>
          {total > 1 && (
            <span className="rounded-full border border-white/12 bg-[#040C0F] px-2 py-0.5 text-[12px] font-normal text-white/70">
              {index + 1} / {total}
            </span>
          )}
        </div>

        {/* Dynamic status based on battery */}
        <p className="mt-1 flex items-center gap-1.5 text-[12px] font-medium leading-none" style={{ color: bLabel.color }}>
          {isLow ? <TrendingDown className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5 fill-current/25" />}
          {bLabel.text}
        </p>

        {/* Content area with car image */}
        <div className="relative" style={{ minHeight: "clamp(75px, 12vh, 110px)" }}>
          <Link href="/documentos" className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-normal text-white/80">
            SOAT vence en <span className="font-medium text-[#d9a000]">3 meses</span>
            <ChevronRight className="h-3.5 w-3.5 text-white/50" />
          </Link>

          <div className="mt-2 flex items-center gap-2">
            <BatteryIcon level={battery} color={bColor} />
            <div>
              <p className="text-[clamp(24px,6.5vw,32px)] font-semibold leading-none tabular-nums text-white">
                {battery}%
              </p>
              <p className="mt-0.5 text-[11px] font-normal text-white/70">Batería actual</p>
            </div>
          </div>

          {vehicle.photo && (
            <img
              src={vehicle.photo}
              alt={vehicle.name}
              className="absolute -right-3 top-0 object-contain object-center"
              style={{ height: "clamp(70px, 11vh, 105px)", width: "clamp(140px, 40vw, 200px)" }}
            />
          )}
        </div>

        {/* Update battery */}
        <button
          type="button"
          onClick={onUpdateBattery}
          className="flex h-[34px] w-full items-center justify-center gap-2 rounded-full border bg-transparent text-[12px] font-medium transition active:scale-[0.98]"
          style={{ borderColor: bColor, color: bColor }}
        >
          Actualizar batería
          <PencilLine className="h-3.5 w-3.5" />
        </button>

        {/* Pagination dots */}
        {total > 1 && (
          <div className="mt-1.5 flex justify-center gap-2">
            {Array.from({ length: total }, (_, i) => (
              <span
                key={i}
                className="h-[6px] w-[6px] rounded-full"
                style={{ backgroundColor: i === index ? accent : "rgba(255,255,255,0.3)" }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function EmptyVehicleCard() {
  return (
    <section className="home-card rounded-[20px] border border-white/[0.07] bg-[#040C0F] p-4 text-center">
      <BatteryCharging className="mx-auto h-7 w-7 text-primary" />
      <h2 className="mt-2 text-base font-semibold">Registra tu vehículo</h2>
      <p className="mt-1 text-sm font-normal text-white/55">Configura tu batería y conector.</p>
      <Link href="/vehiculo/nuevo" className="mt-3 flex h-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
        Registrar vehículo
      </Link>
    </section>
  )
}

/* ─── Charger Card with social proof and benefit-oriented CTA ─── */
function ChargingCard({ charger, index = 0, total = 1 }: { charger: (typeof chargers)[number]; index?: number; total?: number }) {
  const { state } = usePlugo()
  const probability = chargerProbability(charger)
  const minutes = estimatedMinutes(charger.distanceKm)
  const currentBattery = state.battery ?? 42
  const arrival = batteryAtArrival(charger.distanceKm, currentBattery, state.vehicle)

  return (
    <section
      className="home-card relative overflow-hidden rounded-[20px] border border-white/[0.07] bg-[#040C0F]"
      style={{ padding: "clamp(8px, 1.2vh, 14px) 12px" }}
    >
      <div className="relative z-10">
        {/* Best option badge */}
        {index === 0 && (
          <div className="inline-flex items-center gap-1 rounded-full bg-[#369C34]/10 px-2 py-0.5 text-[10px] font-medium text-[#369C34]">
            <Sparkles className="h-2.5 w-2.5 fill-current" />
            Mejor opción para ti
          </div>
        )}

        {/* Charger info row */}
        <div className="mt-1.5 grid grid-cols-[48px_minmax(0,1fr)_62px] items-center gap-2">
          <img
            src="/Dominio/SofIma/terpel-voltex-logo.png"
            alt="Terpel Voltex"
            className="h-[46px] w-[46px] rounded-full object-cover"
          />
          <div className="min-w-0">
            <h2 className="text-[clamp(15px,4.2vw,19px)] font-semibold leading-tight">{shortChargerName(charger.name)}</h2>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] font-normal text-white/65">
              <MapPin className="h-3 w-3 shrink-0 text-white/50" />
              <span className="truncate">{charger.address}, {charger.city}</span>
            </p>
            {/* Social proof: rating + reviews */}
            <div className="mt-1 flex items-center gap-2">
              <p className="flex items-center gap-0.5 text-[11px] font-medium text-primary">
                <ShieldCheck className="h-3 w-3 fill-primary/25" />
                Alta disponibilidad
              </p>
              <span className="flex items-center gap-0.5 text-[10px] text-white/50">
                <Star className="h-2.5 w-2.5 fill-[#d4b01a] text-[#d4b01a]" />
                {charger.rating} ({charger.reviews})
              </span>
            </div>
          </div>
          <ProgressRing value={probability} />
        </div>

        {/* Metrics — compact 3-col grid */}
        <div className="mt-2 grid grid-cols-3 overflow-hidden rounded-[12px] border border-white/[0.07] bg-white/[0.02]">
          <div className="flex flex-col items-center justify-center border-r border-white/[0.07] px-1 py-2">
            <span className="flex items-center gap-1 text-[12px]">
              <Clock3 className="h-3 w-3 text-[#8a30d9]" />
              <span className="font-semibold text-white">A {minutes} min</span>
            </span>
            <span className="text-[10px] font-normal text-white/50">({charger.distanceKm.toFixed(1)} km)</span>
          </div>
          <div className="flex flex-col items-center justify-center border-r border-white/[0.07] px-1 py-2">
            <span className="flex items-center gap-1 text-[12px]">
              <BatteryCharging className="h-3 w-3 text-primary" />
              <span className="font-semibold text-white">~{arrival}%</span>
            </span>
            <span className="text-[10px] font-normal text-white/50">de batería</span>
          </div>
          <div className="flex flex-col items-center justify-center px-1 py-2">
            <span className="flex items-center gap-1 text-[12px]">
              <Tag className="h-3 w-3 text-[#1a75d8]" />
              <span className="font-semibold text-white">{formatCOP(charger.pricePerKwh).replace("COP", "").trim()}</span>
            </span>
            <span className="text-[10px] font-normal text-white/50">/ kWh</span>
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/cargador/${charger.id}`}
          className="cta-pulse mt-2 flex h-[38px] items-center justify-center gap-2 rounded-full bg-[#00944a] text-[14px] font-semibold uppercase tracking-wide text-[#F1F1F1] transition active:scale-[0.97]"
        >
          <Navigation className="h-4 w-4 fill-white" />
          Ir a cargar
        </Link>

        {/* Pagination dots */}
        {total > 1 && (
          <div className="mt-1.5 flex justify-center gap-2">
            {Array.from({ length: total }, (_, i) => (
              <span
                key={i}
                className="h-[6px] w-[6px] rounded-full"
                style={{ backgroundColor: i === index ? accent : "rgba(255,255,255,0.3)" }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function NoChargerCard() {
  return (
    <section className="home-card rounded-[20px] border border-white/[0.07] bg-[#040C0F] p-4 text-center">
      <MapPin className="mx-auto h-7 w-7 text-primary" />
      <h2 className="mt-2 text-base font-semibold">Busca cargadores cerca</h2>
      <p className="mt-1 text-sm font-normal text-white/55">No encontramos una recomendación compatible.</p>
      <Link href="/mapa" className="mt-3 flex h-10 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground">
        Ver mapa
      </Link>
    </section>
  )
}

/* ─── Quick Access ─── */
function QuickAccess() {
  return (
    <section className="mt-auto shrink-0">
      <div className="mb-1.5 flex items-center justify-between">
        <h2 className="text-[14px] font-semibold">Accesos rápidos</h2>
        <Link href="/servicios" className="text-[13px] font-normal text-primary">
          Ver todo
        </Link>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        <QuickTile href="/mapa" icon={<MapPin className="h-5 w-5" />} label="Ver cargadores" tone="green" />
        <QuickTile href="/rutas" icon={<Route className="h-5 w-5" />} label="Planear ruta" tone="blue" />
        <QuickTile href="/servicios" icon={<BriefcaseBusiness className="h-5 w-5" />} label="Servicios" tone="amber" />
        <QuickTile href="/historial" icon={<Zap className="h-5 w-5 fill-current" />} label="Historial de cargas" tone="green" />
      </div>
    </section>
  )
}

function QuickTile({ href, icon, label, tone }: { href: string; icon: React.ReactNode; label: string; tone: "green" | "blue" | "amber" }) {
  const toneClass = {
    green: "border-white/[0.07] text-[#00c49e]",
    blue: "border-[#151d30] text-[#1a8cd8]",
    amber: "border-[#251e10] text-[#d9a000]",
  }[tone]

  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-0.5 rounded-[14px] border bg-[#040C0F] px-1 text-center transition active:scale-[0.97] ${toneClass}`}
      style={{ height: "clamp(62px, 9vh, 76px)" }}
    >
      {icon}
      <span className="text-[10px] font-normal leading-tight text-white/90">{label}</span>
    </Link>
  )
}

/* ─── Sub-components ─── */
function Metric({ icon, label, prefix, sub, tone }: { icon?: React.ReactNode; label: string; prefix?: string; sub: string; tone: "purple" | "green" | "blue" }) {
  const color = tone === "purple" ? "#a33cff" : tone === "green" ? "#00d86f" : "#2588ff"

  return (
    <div className="border-r border-white/8 px-1 py-1.5 text-center last:border-r-0" style={{ minHeight: "clamp(52px, 8vh, 65px)" }}>
      {icon && <div className="mx-auto mb-0.5 flex justify-center" style={{ color }}>{icon}</div>}
      {prefix && <p className="text-[9px] font-normal leading-tight text-white/75">{prefix}</p>}
      <p className="text-[12px] font-semibold leading-tight text-white" style={!icon ? { color } : undefined}>{label}</p>
      <p className="mt-0.5 text-[9px] font-normal leading-tight text-white/70">{sub}</p>
    </div>
  )
}

function ProgressRing({ value }: { value: number }) {
  return (
    <div
      className="grid place-items-center rounded-full"
      style={{
        height: "clamp(58px, 8.5vh, 74px)",
        width: "clamp(58px, 8.5vh, 74px)",
        background: `conic-gradient(#00944a ${value * 3.6}deg, rgba(0,148,74,0.12) 0deg)`,
      }}
    >
      <div
        className="grid place-items-center rounded-full bg-[#040C0F] text-center leading-none"
        style={{ height: "clamp(50px, 7.5vh, 66px)", width: "clamp(50px, 7.5vh, 66px)" }}
      >
        <div>
          <span className="block text-[clamp(15px,2.4vh,19px)] font-semibold leading-none">{value}%</span>
          <span className="block text-[8px] font-normal leading-none text-white/60" style={{ marginTop: "3px" }}>disponible</span>
        </div>
      </div>
    </div>
  )
}

function BatteryIcon({ level, color }: { level: number; color: string }) {
  return (
    <div className="relative h-[32px] w-[20px] rounded-[5px] border-[1.5px] border-white/20 bg-black/25 p-0.5">
      <span className="absolute -top-1.5 left-1/2 h-1.5 w-3 -translate-x-1/2 rounded-t-sm bg-white/20" />
      <span
        className="absolute bottom-[2px] left-[2px] right-[2px] rounded-sm"
        style={{
          height: `${Math.max(10, Math.min(level, 100))}%`,
          background: `linear-gradient(to top, ${color}, ${color}cc)`,
        }}
      />
    </div>
  )
}

function shortChargerName(name: string) {
  return name.replace(" Calle 100", "")
}
