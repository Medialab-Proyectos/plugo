"use client"

import * as React from "react"
import Link from "next/link"
import { notFound, useRouter, useParams } from "next/navigation"
import { Star, MapPin, Zap, Clock, Shield, BatteryCharging, ArrowLeft, Share2 } from "lucide-react"
import { PhoneFrame } from "@/components/phone-frame"
import { GlassCard } from "@/components/glass-card"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { chargers, formatCOP } from "@/lib/mock-data"
import { useCumbreva } from "@/lib/cumbreva-context"

const statusMap = {
  disponible: { label: "Disponible ahora", tone: "success" as const },
  ocupado: { label: "Ocupado", tone: "warning" as const },
  "fuera-de-servicio": { label: "Fuera de servicio", tone: "danger" as const },
}

export default function ChargerDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const charger = chargers.find((c) => c.id === params.id)
  const { state } = useCumbreva()

  if (!charger) return notFound()

  const status = statusMap[charger.status]
  const isAvailable = charger.status === "disponible"
  const isCompatible = state.vehicle ? charger.connectors.includes(state.vehicle.connector as never) : true

  return (
    <PhoneFrame noBottomPad>
      <div className="flex min-h-dvh flex-col pb-32">
        {/* Hero */}
        <div className="relative h-64 w-full overflow-hidden bg-background-secondary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={charger.photo || "/placeholder.svg"} alt={charger.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="glass-strong flex h-10 w-10 items-center justify-center rounded-2xl"
              aria-label="Volver"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="glass-strong flex h-10 w-10 items-center justify-center rounded-2xl"
              aria-label="Compartir"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
          <div className="absolute bottom-3 left-4">
            <StatusBadge tone={status.tone} withDot>
              {status.label}
            </StatusBadge>
          </div>
        </div>

        <div className="space-y-4 px-5 pt-5">
          <div>
            <div className="flex items-center gap-2">
              {charger.type === "privado" && (
                <span className="inline-flex items-center rounded-full bg-blue-500/15 px-2.5 py-1 text-[11px] font-medium text-blue-300 ring-1 ring-blue-400/30">
                  Anfitrión
                </span>
              )}
              <h1 className="text-2xl font-semibold tracking-tight text-balance">{charger.name}</h1>
            </div>
            <div className="mt-1.5 flex items-center gap-3 text-sm text-foreground-muted">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {charger.address}
              </span>
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                <span className="font-medium text-foreground">{charger.rating}</span>
                <span>({charger.reviews})</span>
              </span>
            </div>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-3 gap-2.5">
            <Spec Icon={Zap} label="Potencia" value={`${charger.power} kW`} />
            <Spec Icon={BatteryCharging} label="Conectores" value={charger.connectors.join(" · ")} small />
            <Spec
              Icon={Clock}
              label="Espera"
              value={charger.estimatedWaitMin > 0 ? `~${charger.estimatedWaitMin} min` : "Sin espera"}
            />
          </div>

          {/* Compatibilidad */}
          {state.vehicle && (
            <GlassCard
              className={
                isCompatible ? "border-success/40 bg-success/5" : "border-warning/40 bg-warning/5"
              }
            >
              <div className="flex items-center gap-3">
                <div
                  className={
                    isCompatible
                      ? "flex h-10 w-10 items-center justify-center rounded-2xl bg-success/15 text-success"
                      : "flex h-10 w-10 items-center justify-center rounded-2xl bg-warning/15 text-warning"
                  }
                >
                  <Shield className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {isCompatible ? "Compatible con tu vehículo" : "Puedes usarlo con adaptador"}
                  </p>
                  <p className="text-xs text-foreground-muted">
                    {state.vehicle.name} · Conector {state.vehicle.connector}
                  </p>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Precio */}
          <GlassCard variant="strong">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-foreground-soft">Precio</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-gradient-primary">
                  {formatCOP(charger.pricePerKwh)}
                </p>
                <p className="text-xs text-foreground-muted">por kWh</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-foreground-soft">Estimado</p>
                <p className="mt-1 text-base font-semibold tabular-nums">
                  {formatCOP(charger.pricePerKwh * 30)}
                </p>
                <p className="text-xs text-foreground-muted">para 30 kWh</p>
              </div>
            </div>
          </GlassCard>

          {/* Horarios */}
          <GlassCard>
            <p className="text-sm font-semibold">Horarios y acceso</p>
            <div className="mt-2 space-y-1.5 text-sm text-foreground-muted">
              <p>Disponible 24/7</p>
              <p>Pago electrónico desde la app</p>
            </div>
            {charger.amenities.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {charger.amenities.map((a) => (
                  <span
                    key={a}
                    className="rounded-full bg-overlay-1 px-2.5 py-1 text-[11px] text-foreground-muted"
                  >
                    {a}
                  </span>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Anfitrión */}
          {charger.host && (
            <GlassCard variant="strong">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={charger.host.avatar || "/placeholder.svg"} alt={charger.host.name} />
                  <AvatarFallback>{charger.host.name[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold">{charger.host.name}</p>
                    {charger.host.verified && (
                      <StatusBadge tone="primary">Anfitrión verificado</StatusBadge>
                    )}
                  </div>
                  <p className="text-xs text-foreground-muted">
                    {charger.host.neighborhood} · {charger.host.sessions} sesiones · ★ {charger.host.rating}
                  </p>
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                <p className="text-xs font-medium text-foreground">Reglas de acceso</p>
                <ul className="space-y-1 text-xs text-foreground-muted">
                  {charger.host.rules.map((r) => (
                    <li key={r}>• {r}</li>
                  ))}
                </ul>
              </div>
            </GlassCard>
          )}

          {/* Reviews */}
          <GlassCard>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Reseñas</p>
              <span className="text-xs text-foreground-muted">{charger.reviews} en total</span>
            </div>
            <div className="mt-3 space-y-3">
              <Review name="Laura G." rating={5} text="Muy buen punto, conector firme y zona segura." />
              <Review name="Miguel R." rating={4} text="Carga estable, café cercano para esperar." />
            </div>
          </GlassCard>
        </div>

        {/* CTA */}
        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[440px] p-4 md:max-w-[420px] md:p-3">
          <div className="glass-strong flex items-center gap-3 rounded-3xl p-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-foreground-muted">Estimado para 30 kWh</p>
              <p className="text-sm font-semibold">{formatCOP(charger.pricePerKwh * 30)}</p>
            </div>
            <Button
              asChild
              disabled={!isAvailable}
              className="h-12 rounded-2xl bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90 disabled:bg-overlay-1 disabled:text-foreground-soft"
            >
              <Link href={isAvailable ? `/reserva/${charger.id}` : "#"}>
                {isAvailable ? "Reservar carga" : "No disponible"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </PhoneFrame>
  )
}

function Spec({
  Icon,
  label,
  value,
  small,
}: {
  Icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  small?: boolean
}) {
  return (
    <div className="glass rounded-2xl p-3">
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-2 text-[10px] uppercase tracking-wider text-foreground-soft">{label}</p>
      <p className={small ? "mt-0.5 text-xs font-semibold leading-tight" : "mt-0.5 text-sm font-semibold"}>
        {value}
      </p>
    </div>
  )
}

function Review({ name, rating, text }: { name: string; rating: number; text: string }) {
  return (
    <div className="rounded-2xl bg-overlay-subtle p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{name}</p>
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={
                i < rating
                  ? "h-3.5 w-3.5 fill-warning text-warning"
                  : "h-3.5 w-3.5 text-foreground-soft/40"
              }
            />
          ))}
        </div>
      </div>
      <p className="mt-1.5 text-xs text-foreground-muted">{text}</p>
    </div>
  )
}
