"use client"

import * as React from "react"
import Link from "next/link"
import { notFound, useParams, useRouter } from "next/navigation"
import { ArrowLeft, Check, CreditCard, Clock, Calendar, MapPin, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { PhoneFrame } from "@/components/phone-frame"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Confetti } from "@/components/confetti"
import { chargers, formatCOP } from "@/lib/mock-data"
import { useCumbreva } from "@/lib/cumbreva-context"
import { cn } from "@/lib/utils"

const slots = [
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
]

const durations = [
  { id: "30", label: "30 min", kwh: 12 },
  { id: "45", label: "45 min", kwh: 18 },
  { id: "60", label: "1 hora", kwh: 25 },
  { id: "90", label: "1h 30 min", kwh: 38 },
]

export default function ReservaPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { dispatch } = useCumbreva()
  const charger = chargers.find((c) => c.id === params.id)

  const [step, setStep] = React.useState<"form" | "loading" | "success">("form")
  const [slot, setSlot] = React.useState(slots[2])
  const [duration, setDuration] = React.useState(durations[2])
  const [method, setMethod] = React.useState("card")

  if (!charger) return notFound()

  const subtotal = charger.pricePerKwh * duration.kwh
  const fee = Math.round(subtotal * 0.05)
  const total = subtotal + fee

  const handleConfirm = () => {
    setStep("loading")
    setTimeout(() => {
      setStep("success")
      dispatch({ type: "ADD_COINS", amount: 30 })
    }, 1200)
  }

  if (step === "loading") {
    return (
      <PhoneFrame noBottomPad>
        <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
          <Spinner className="h-10 w-10 text-primary" />
          <p className="text-sm text-foreground-muted">Confirmando tu reserva…</p>
        </div>
      </PhoneFrame>
    )
  }

  if (step === "success") {
    return (
      <PhoneFrame noBottomPad>
        <div className="relative flex min-h-dvh flex-col px-6 pb-8 pt-10">
          <Confetti />
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="relative mb-6 animate-pop-in">
              <div className="absolute inset-0 -m-6 rounded-full bg-success/20 blur-2xl" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-success text-[#00150F] glow-primary animate-cumbreva-glow">
                <Check className="h-12 w-12" strokeWidth={3} />
              </div>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-balance">Reserva confirmada</h1>
            <p className="mt-2 max-w-[28ch] text-sm text-foreground-muted text-pretty">
              Tu electrolinera estará disponible a las {slot}.
            </p>

            <GlassCard variant="strong" className="mt-6 w-full text-left">
              <div className="space-y-2.5">
                <Row Icon={MapPin} label="Electrolinera" value={charger.name} />
                <Row Icon={Calendar} label="Hoy" value={`${slot} · ${duration.label}`} />
                <Row Icon={CreditCard} label="Total" value={formatCOP(total)} bold />
              </div>
            </GlassCard>

            <GlassCard className="mt-3 w-full">
              <div className="flex items-center gap-2 text-warning">
                <Sparkles className="h-4 w-4" />
                <p className="text-sm font-medium">Ganaste 30 CumbrevaCoins</p>
              </div>
            </GlassCard>
          </div>

          <div className="flex flex-col gap-2.5 pt-6">
            <Button
              asChild
              className="h-14 w-full rounded-2xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  `${charger.address}, ${charger.city}`,
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                Abrir ruta
              </a>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="h-12 w-full rounded-2xl text-foreground-muted hover:bg-overlay-hover"
            >
              <Link href="/inicio">Ir al inicio</Link>
            </Button>
          </div>
        </div>
      </PhoneFrame>
    )
  }

  return (
    <PhoneFrame noBottomPad>
      <div className="flex min-h-dvh flex-col px-5 pb-8 pt-5">
        <div className="mb-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-card"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold">Reserva</h1>
            <p className="text-xs text-foreground-muted">{charger.name}</p>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          {/* Hora */}
          <GlassCard>
            <div className="mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">Selecciona tu horario</p>
            </div>
            <div className="-mx-1 flex flex-wrap gap-2">
              {slots.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSlot(s)}
                  className={cn(
                    "min-w-[68px] rounded-2xl border px-3 py-2 text-sm transition",
                    slot === s
                      ? "border-primary/60 bg-primary/10 text-primary"
                      : "border-border bg-card text-foreground hover:bg-overlay-hover",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Duración */}
          <GlassCard>
            <p className="text-sm font-semibold">Duración estimada</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {durations.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={cn(
                    "flex flex-col items-start rounded-2xl border p-3 text-left transition",
                    duration.id === d.id
                      ? "border-primary/60 bg-primary/10"
                      : "border-border bg-card hover:bg-overlay-hover",
                  )}
                >
                  <span className="text-sm font-medium">{d.label}</span>
                  <span className="text-xs text-foreground-muted">~{d.kwh} kWh estimados</span>
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Método de pago */}
          <GlassCard>
            <p className="text-sm font-semibold">Método de pago</p>
            <div className="mt-3 space-y-2">
              <PaymentRow id="card" current={method} onChange={setMethod} title="Tarjeta •• 4821" subtitle="Visa" />
              <PaymentRow id="pse" current={method} onChange={setMethod} title="PSE" subtitle="Débito directo" />
              <PaymentRow
                id="coins"
                current={method}
                onChange={setMethod}
                title="CumbrevaCoins"
                subtitle="Usa 180 monedas (-$5.000)"
              />
            </div>
          </GlassCard>

          {/* Resumen */}
          <GlassCard variant="strong">
            <p className="mb-3 text-sm font-semibold">Resumen</p>
            <div className="space-y-2 text-sm">
              <Line label={`${duration.kwh} kWh estimados`} value={formatCOP(subtotal)} />
              <Line label="Servicio" value={formatCOP(fee)} muted />
              <div className="my-2 h-px bg-border" />
              <Line label="Total estimado" value={formatCOP(total)} bold />
            </div>
            <p className="mt-3 text-[11px] text-foreground-soft">
              Política: 100% reembolso si cancelas con 30 minutos de anticipación. Penalidad de {formatCOP(8000)} por
              no llegar.
            </p>
          </GlassCard>
        </div>

        <div className="pt-4">
          <Button
            onClick={handleConfirm}
            className="h-14 w-full rounded-2xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Confirmar reserva
          </Button>
        </div>
      </div>
    </PhoneFrame>
  )
}

function PaymentRow({
  id,
  current,
  onChange,
  title,
  subtitle,
}: {
  id: string
  current: string
  onChange: (v: string) => void
  title: string
  subtitle: string
}) {
  const selected = current === id
  return (
    <button
      type="button"
      onClick={() => onChange(id)}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition",
        selected ? "border-primary/60 bg-primary/10" : "border-border bg-card hover:bg-overlay-hover",
      )}
    >
      <div
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full border",
          selected ? "border-primary bg-primary" : "border-foreground-soft",
        )}
      >
        {selected && <Check className="h-3 w-3 text-primary-foreground" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-foreground-muted">{subtitle}</p>
      </div>
      <CreditCard className="h-4 w-4 text-foreground-muted" />
    </button>
  )
}

function Line({
  label,
  value,
  bold,
  muted,
}: {
  label: string
  value: string
  bold?: boolean
  muted?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn("text-sm", muted && "text-foreground-muted")}>{label}</span>
      <span className={cn("text-sm tabular-nums", bold && "text-base font-semibold")}>{value}</span>
    </div>
  )
}

function Row({
  Icon,
  label,
  value,
  bold,
}: {
  Icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  bold?: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-foreground-muted" />
      <span className="text-xs uppercase tracking-wider text-foreground-soft">{label}</span>
      <span className={cn("ml-auto text-sm tabular-nums", bold && "text-base font-semibold")}>{value}</span>
    </div>
  )
}
