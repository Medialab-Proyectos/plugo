"use client"

import * as React from "react"
import Link from "next/link"
import {
  BatteryCharging,
  ChevronRight,
  Edit3,
  Plug,
  Plus,
  Settings,
  Sparkles,
  Calendar,
  Gauge,
  Info,
} from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { EmptyState } from "@/components/empty-state"
import { BatteryModal } from "@/components/battery-modal"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useCumbreva } from "@/lib/cumbreva-context"
import { batteryState } from "@/lib/decision"
import { realRange, currentConditions } from "@/lib/autonomy"
import { cn } from "@/lib/utils"

const tips = [
  {
    title: "Carga inteligente",
    desc: "Carga entre 20% y 80% para maximizar la vida útil de tu batería.",
    Icon: Sparkles,
  },
  {
    title: "Pre-acondicionamiento",
    desc: "Activa el clima mientras está cargando para no perder eficiencia.",
    Icon: BatteryCharging,
  },
  {
    title: "Conducción eficiente",
    desc: "Anticipa frenadas y aprovecha la regeneración para alargar tu autonomía.",
    Icon: Gauge,
  },
]

export default function MiVehiculoPage() {
  const { state } = useCumbreva()
  const [batteryOpen, setBatteryOpen] = React.useState(false)
  const v = state.vehicle

  if (!v) {
    return (
      <div className="px-5 pb-6 pt-5">
        <PageHeader title="Mi vehículo" subtitle="Gestiona tu eléctrico" />
        <div className="mt-6">
          <EmptyState
            Icon={Plug}
            title="Aún no tienes un vehículo registrado"
            description="Agrega tu primer eléctrico en menos de 2 minutos. Te ayudaremos a configurar conector, autonomía y preferencias."
            action={
              <Button asChild className="h-11 rounded-2xl bg-primary px-5 text-primary-foreground">
                <Link href="/vehiculo/nuevo">
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar vehículo
                </Link>
              </Button>
            }
          />
        </div>
      </div>
    )
  }

  const battery = state.battery
  const status = batteryState(battery)
  const tone =
    status.level === "urgente" || status.level === "rojo"
      ? "danger"
      : status.level === "amarillo"
        ? "warning"
        : "success"

  return (
    <>
      <div className="flex flex-col gap-5 px-5 pb-6 pt-5">
        <PageHeader title="Mi vehículo" subtitle="Tu eléctrico, siempre listo" />

        {/* Hero card */}
        <GlassCard className="relative overflow-hidden p-0">
          <div className="relative">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-90"
              style={{ backgroundImage: `url(${v.photo || "/vehicle-byd-seagull-side-dark.jpg"})` }}
              aria-hidden
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent"
            />
            <div className="relative px-5 pb-4 pt-44">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-widest text-foreground-soft">
                    {v.brand} · {v.year || "—"}
                  </p>
                  <h2 className="mt-1 truncate text-2xl font-semibold tracking-tight">{v.name || v.model}</h2>
                  <p className="text-sm text-foreground-muted">{v.plate || "Placa no registrada"}</p>
                </div>
                <StatusBadge tone={tone} withDot>
                  {status.message}
                </StatusBadge>
              </div>
            </div>
          </div>

          {/* Battery row (manual, optional) */}
          <div className="border-t border-border/60 px-5 py-4">
            {battery !== null ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-foreground-soft">
                      Autonomía real hoy
                    </p>
                    <p className="mt-0.5 text-2xl font-semibold tabular-nums">
                      ~{realRange(v, battery, currentConditions(state.preferences)).km} km
                    </p>
                    <p className="text-[11px] text-foreground-muted">
                      {battery}% · ajustado por clima y relieve
                    </p>
                  </div>
                  <Button
                    onClick={() => setBatteryOpen(true)}
                    variant="outline"
                    className="h-10 rounded-2xl border-border bg-card text-foreground"
                  >
                    <BatteryCharging className="mr-2 h-4 w-4 text-primary" />
                    Actualizar batería
                  </Button>
                </div>
                <Progress value={battery} className="mt-3 h-2 bg-muted" />
                <p className="mt-2 text-[11px] text-foreground-muted">{status.hint}</p>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setBatteryOpen(true)}
                className="flex w-full items-center justify-between rounded-2xl bg-overlay-1 px-4 py-3 text-left transition hover:bg-overlay-hover"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                    <BatteryCharging className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Actualizar batería</p>
                    <p className="text-[11px] text-foreground-muted">
                      Es opcional, pero mejora tus recomendaciones.
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-foreground-muted" />
              </button>
            )}
          </div>
        </GlassCard>

        {/* Specs */}
        <div className="grid grid-cols-2 gap-3">
          <GlassCard className="p-4">
            <p className="text-[10px] uppercase tracking-widest text-foreground-soft">Conector</p>
            <p className="mt-2 text-base font-semibold">{v.connector || "—"}</p>
            <p className="mt-1 text-[11px] text-foreground-muted">
              {v.adapters?.length ? `+ ${v.adapters.length} adaptadores` : "Sin adaptadores"}
            </p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-[10px] uppercase tracking-widest text-foreground-soft">Autonomía máxima</p>
            <p className="mt-2 text-base font-semibold">
              {v.range || "—"} <span className="text-sm text-foreground-muted">km</span>
            </p>
            <p className="mt-1 text-[11px] text-foreground-muted">Al 100% de carga</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-[10px] uppercase tracking-widest text-foreground-soft">Color</p>
            <p className="mt-2 text-base font-semibold capitalize">{v.color || "—"}</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-[10px] uppercase tracking-widest text-foreground-soft">Año</p>
            <p className="mt-2 text-base font-semibold">{v.year || "—"}</p>
          </GlassCard>
        </div>

        {/* Quick actions */}
        <GlassCard className="overflow-hidden p-0">
          <Link
            href="/vehiculo/nuevo"
            className="flex items-center justify-between border-b border-border/60 px-4 py-4 transition-colors hover:bg-overlay-hover"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-overlay-1">
                <Edit3 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Editar vehículo</p>
                <p className="text-xs text-foreground-muted">Marca, modelo, conector, autonomía</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-foreground-soft" />
          </Link>
          <Link
            href="/documentos"
            className="flex items-center justify-between border-b border-border/60 px-4 py-4 transition-colors hover:bg-overlay-hover"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-overlay-1">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Documentos y vencimientos</p>
                <p className="text-xs text-foreground-muted">SOAT, técnico-mecánica, seguro</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-foreground-soft" />
          </Link>
          <Link
            href="/perfil/preferencias"
            className="flex items-center justify-between px-4 py-4 transition-colors hover:bg-overlay-hover"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-overlay-1">
                <Settings className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Preferencias de carga</p>
                <p className="text-xs text-foreground-muted">Velocidad, alertas, batería mínima</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-foreground-soft" />
          </Link>
        </GlassCard>

        {/* Tips */}
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-foreground-soft">
            Cuida tu batería
          </h3>
          <div className="flex flex-col gap-3">
            {tips.map(({ title, desc, Icon }) => (
              <GlassCard key={title} className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-foreground-muted">{desc}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        <GlassCard className="flex items-start gap-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-xs leading-relaxed text-foreground-muted">
            La batería es un dato manual y referencial. Te ayuda a recibir mejores recomendaciones de carga y rutas.
          </p>
        </GlassCard>
      </div>

      <BatteryModal open={batteryOpen} onOpenChange={setBatteryOpen} />
    </>
  )
}
