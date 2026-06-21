"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, Sparkles, Star } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { FavoriteButton } from "@/components/favorite-button"
import { services, formatCOP } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const categories = [
  { id: "all", label: "Todos" },
  { id: "Lavado premium", label: "Lavado" },
  { id: "Detailing", label: "Detailing" },
  { id: "Mecánica EV", label: "Mecánica" },
  { id: "Instalación de cargadores", label: "Instalación" },
  { id: "Asistencia", label: "Asistencia" },
]

export default function ServiciosPage() {
  const [active, setActive] = React.useState("all")

  const filtered = services.filter((s) => active === "all" || s.category === active)

  return (
    <div className="space-y-5 px-5 pb-6 pt-5">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">Marketplace</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Cuida tu vehículo</h1>
        <p className="mt-1 text-xs text-foreground-muted">
          Aliados verificados especializados en eléctricos.
        </p>
      </header>

      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 no-scrollbar">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActive(c.id)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
              active === c.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground-muted hover:text-foreground",
            )}
            aria-pressed={active === c.id}
          >
            {c.label}
          </button>
        ))}
      </div>

      <Link href="#" className="block">
        <GlassCard className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/15 via-card to-card">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Membresía PLUGO+</p>
              <p className="mt-1 text-xs text-foreground-muted">
                Hasta 30% de descuento en servicios y reservas prioritarias.
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-primary" />
          </div>
        </GlassCard>
      </Link>

      <div className="space-y-4">
        {filtered.map((s) => {
          const isAvailable = s.available
          return (
            <article
              key={s.id}
              className="group block overflow-hidden rounded-3xl border border-border bg-card transition hover:border-primary/40"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.photo || "/placeholder.svg"}
                  alt={s.name}
                  className={cn(
                    "h-full w-full object-cover transition duration-500 group-hover:scale-105",
                    !isAvailable && "opacity-50",
                  )}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                <div className="absolute bottom-3 left-3 rounded-full bg-card/80 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-foreground backdrop-blur">
                  {s.category}
                </div>
                {!isAvailable && (
                  <div className="absolute right-3 top-3 rounded-full bg-background/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground-muted backdrop-blur">
                    Próximamente
                  </div>
                )}
                <div className="absolute right-3 bottom-3">
                  <FavoriteButton serviceId={s.id} serviceName={s.name} />
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{s.name}</p>
                    <p className="mt-0.5 text-xs text-foreground-muted">{s.city}</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-overlay-1 px-2 py-1 text-xs">
                    <Star className="h-3 w-3 fill-warning text-warning" />
                    <span className="font-medium">{s.rating}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-end justify-between border-t border-border/60 pt-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-foreground-soft">Desde</p>
                    <p className="text-base font-semibold tabular-nums">
                      {s.priceFrom > 0 ? formatCOP(s.priceFrom) : "Por suscripción"}
                    </p>
                  </div>
                  {isAvailable ? (
                    <Link
                      href="#"
                      className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition group-hover:bg-primary/90"
                    >
                      Reservar
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      className="rounded-full border border-border bg-overlay-1 px-4 py-2 text-xs font-semibold text-foreground-muted"
                    >
                      Próximamente
                    </button>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
