"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  Camera,
  Check,
  ChevronRight,
  DollarSign,
  Home,
  MapPin,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

const benefits = [
  { icon: TrendingUp, title: "Hasta $480.000/mes", description: "Por compartir tu wallbox 4 horas al día." },
  { icon: ShieldCheck, title: "Seguro completo", description: "Cobertura por daños hasta $50M COP." },
  { icon: Calendar, title: "Tú decides cuándo", description: "Disponibilidad flexible y cancelación libre." },
]

const steps = [
  { num: 1, title: "Verifica tu cargador", description: "Inspección remota gratuita." },
  { num: 2, title: "Configura precio y horarios", description: "PLUGO sugiere tarifas óptimas." },
  { num: 3, title: "Recibe huéspedes", description: "Activación automática y pagos seguros." },
]

export default function AnfitrionPage() {
  const router = useRouter()
  const [enrolled, setEnrolled] = useState(false)
  const [step, setStep] = useState<"intro" | "form">("intro")

  if (enrolled) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/15 text-success ring-4 ring-success/10">
          <Check className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground">¡Listo, Anfitrión!</h1>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Recibirás una llamada en las próximas 24h para programar la verificación de tu cargador.
          </p>
        </div>
        <Button onClick={() => router.push("/inicio")} className="h-12 px-8">
          Volver al inicio
        </Button>
      </div>
    )
  }

  if (step === "form") {
    return (
      <div className="space-y-6 pb-6">
        <button
          onClick={() => setStep("intro")}
          className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Atrás
        </button>

        <header>
          <p className="text-xs font-medium uppercase tracking-wider text-primary">Modo Anfitrión</p>
          <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight text-foreground">
            Configura tu cargador
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Completa los datos para empezar a recibir huéspedes.
          </p>
        </header>

        <GlassCard className="space-y-5 p-5">
          <div className="space-y-2">
            <Label htmlFor="address" className="text-xs font-medium text-muted-foreground">
              Dirección
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              <Input id="address" placeholder="Calle 85 # 11-53" className="h-11 pl-10" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="power" className="text-xs font-medium text-muted-foreground">
                Potencia (kW)
              </Label>
              <Input id="power" type="number" placeholder="22" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="connector" className="text-xs font-medium text-muted-foreground">
                Conector
              </Label>
              <select id="connector" className="h-11 w-full rounded-xl border border-border bg-input px-3 text-sm">
                <option>Tipo 2 (AC)</option>
                <option>CCS2 (DC)</option>
                <option>CHAdeMO</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price" className="text-xs font-medium text-muted-foreground">
              Precio por kWh (COP)
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              <Input id="price" type="number" defaultValue="900" className="h-11 pl-10" />
            </div>
            <p className="text-[11px] text-muted-foreground">PLUGO sugiere $850 - $1.100 en tu zona.</p>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-secondary/40 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Disponible 24/7</p>
              <p className="text-[11px] text-muted-foreground">Configura horarios específicos después.</p>
            </div>
            <Switch defaultChecked />
          </div>

          <button
            type="button"
            className="flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-secondary/30 px-4 py-6 text-center transition hover:border-primary/50"
          >
            <Camera className="h-7 w-7 text-primary" />
            <p className="text-sm font-medium">Sube fotos de tu cargador</p>
            <p className="text-[11px] text-muted-foreground">Mínimo 2 — máximo 6</p>
          </button>
        </GlassCard>

        <Button onClick={() => setEnrolled(true)} className="h-12 w-full">
          Solicitar verificación
        </Button>
        <p className="text-center text-[11px] text-muted-foreground">
          Al continuar aceptas los términos del Programa Anfitrión PLUGO.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </button>

      <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/20 via-card to-card p-6">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-primary">
            <Sparkles className="h-3 w-3" />
            Nuevo programa
          </div>
          <h1 className="mt-4 font-serif text-3xl font-medium leading-tight tracking-tight text-foreground text-balance">
            Convierte tu cargador en ingreso pasivo
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
            Únete a la red PLUGO de anfitriones y comparte tu wallbox cuando no lo uses. Sin complicaciones, con
            seguro y soporte 24/7.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {benefits.map((b) => {
          const Icon = b.icon
          return (
            <GlassCard key={b.title} className="p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">{b.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{b.description}</p>
            </GlassCard>
          )
        })}
      </div>

      <div>
        <p className="px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Cómo funciona</p>
        <div className="mt-3 space-y-2">
          {steps.map((s) => (
            <div key={s.num} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-sm font-semibold text-primary">
                {s.num}
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm font-medium text-foreground">{s.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <GlassCard className="p-5">
        <div className="flex items-center gap-3">
          <Zap className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">Calculadora de ingresos</p>
            <p className="text-[11px] text-muted-foreground">Wallbox 22 kW · 4 horas/día · $900/kWh</p>
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between rounded-2xl bg-secondary/40 px-5 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Estimado mensual</p>
            <p className="font-mono text-2xl font-semibold tabular-nums text-foreground">
              $480.000<span className="ml-1 text-xs font-normal text-muted-foreground">COP</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Anual</p>
            <p className="font-mono text-lg font-medium tabular-nums text-success">$5.7M</p>
          </div>
        </div>
      </GlassCard>

      <Button onClick={() => setStep("form")} className="h-12 w-full">
        <Home className="mr-2 h-4 w-4" />
        Quiero ser anfitrión
        <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  )
}
