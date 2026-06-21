"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Battery, Bell, Globe, Leaf, Moon, Zap } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { GlassCard } from "@/components/glass-card"
import { usePlugo } from "@/lib/plugo-context"
import { cn } from "@/lib/utils"

export default function PreferenciasPage() {
  const router = useRouter()
  const { state, dispatch } = usePlugo()
  const { preferences } = state

  const setMapPriority = (mapPriority: typeof preferences.mapPriority) =>
    dispatch({ type: "SET_PREFERENCES", prefs: { mapPriority } })

  const setChargingPriority = (chargingPriority: typeof preferences.chargingPriority) =>
    dispatch({ type: "SET_PREFERENCES", prefs: { chargingPriority } })

  const setNotif = (k: keyof typeof preferences.notifications, v: boolean) =>
    dispatch({
      type: "SET_PREFERENCES",
      prefs: { notifications: { ...preferences.notifications, [k]: v } },
    })

  return (
    <div className="space-y-5 px-5 pb-6 pt-5">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-foreground-muted transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </button>

      <header>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">Configuración</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Preferencias</h1>
        <p className="mt-1 text-xs text-foreground-muted">Personaliza cómo PLUGO toma decisiones por ti.</p>
      </header>

      <Section title="Carga inteligente" Icon={Battery}>
        <Field label="Prioridad de carga" description="Qué prioriza la app cuando te recomienda electrolineras.">
          <SegmentControl
            value={preferences.chargingPriority}
            onChange={setChargingPriority}
            options={[
              { value: "ahorrar", label: "Ahorro" },
              { value: "balanceado", label: "Equilibrio" },
              { value: "rapido", label: "Velocidad" },
            ]}
          />
        </Field>
      </Section>

      <Section title="Búsqueda en mapa" Icon={Zap}>
        <Field label="Cómo ordenamos las electrolineras" description="Decide qué aparece primero en tus búsquedas.">
          <SegmentControl
            value={preferences.mapPriority}
            onChange={setMapPriority}
            options={[
              { value: "cercano", label: "Cercanos" },
              { value: "barato", label: "Económicos" },
              { value: "confiable", label: "Confiables" },
              { value: "calificado", label: "Mejor calificados" },
            ]}
          />
        </Field>
      </Section>

      <Section title="Notificaciones" Icon={Bell}>
        <Toggle
          label="Electrolineras cercanas"
          description="Te avisamos cuando hay un punto disponible en tu zona."
          checked={preferences.notifications.chargers}
          onCheckedChange={(v) => setNotif("chargers", v)}
        />
        <Toggle
          label="Mis viajes"
          description="Alertas de paradas y cambios de ruta."
          checked={preferences.notifications.trips}
          onCheckedChange={(v) => setNotif("trips", v)}
        />
        <Toggle
          label="Documentos por vencer"
          description="Aviso 30 días antes del vencimiento."
          checked={preferences.notifications.documents}
          onCheckedChange={(v) => setNotif("documents", v)}
        />
        <Toggle
          label="Promociones y precios"
          description="Descuentos en aliados PLUGO+."
          checked={preferences.notifications.prices}
          onCheckedChange={(v) => setNotif("prices", v)}
        />
      </Section>

      <Section title="Eco e impacto" Icon={Leaf}>
        <Toggle label="Mostrar CO₂ ahorrado" description="Visualiza tu impacto ambiental." checked disabled />
      </Section>

      <Section title="App" Icon={Moon}>
        <Toggle label="Modo oscuro" description="Por defecto en PLUGO." checked disabled />
        <Field label="Idioma" description="Español (Colombia)" Icon={Globe} />
      </Section>
    </div>
  )
}

function Section({
  title,
  Icon,
  children,
}: {
  title: string
  Icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Icon className="h-3.5 w-3.5 text-primary" />
        <p className="text-[10px] font-semibold uppercase tracking-widest text-foreground-soft">{title}</p>
      </div>
      <GlassCard className="divide-y divide-border/60 p-0">{children}</GlassCard>
    </div>
  )
}

function Field({
  label,
  description,
  children,
  Icon,
}: {
  label: string
  description?: string
  children?: React.ReactNode
  Icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{label}</p>
          {description && <p className="mt-0.5 text-xs text-foreground-muted">{description}</p>}
        </div>
        <div className="shrink-0">{Icon ? <Icon className="h-4 w-4 text-foreground-muted" /> : null}</div>
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  )
}

function Toggle({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
}: {
  label: string
  description?: string
  checked: boolean
  onCheckedChange?: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{label}</p>
        {description && <p className="mt-0.5 text-xs text-foreground-muted">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  )
}

function SegmentControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <div className="flex w-full gap-1 rounded-2xl bg-overlay-1 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "flex-1 rounded-xl px-2 py-1.5 text-xs font-medium transition",
            value === o.value ? "bg-primary text-primary-foreground" : "text-foreground-muted",
          )}
          aria-pressed={value === o.value}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
