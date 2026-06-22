"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Compass, CalendarCheck, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PhoneFrame } from "@/components/phone-frame"
import { CumbrevaLogo } from "@/components/cumbreva-logo"
import { useTheme } from "@/lib/theme-context"
import { cn } from "@/lib/utils"

const steps = [
  {
    Icon: Compass,
    title: "Tu carro electrico, sin incertidumbre",
    text: "Encuentra electrolineras, planea rutas y evita filas antes de salir.",
  },
  {
    Icon: CalendarCheck,
    title: "Reserva antes de llegar",
    text: "Consulta disponibilidad, precios y compatibilidad antes de moverte.",
  },
  {
    Icon: Users,
    title: "Convierte la carga en comunidad",
    text: "Usa electrolineras privadas verificadas o publica la tuya para generar ingresos.",
  },
]

export default function OnboardingPage() {
  const [step, setStep] = React.useState(0)
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const isLast = step === steps.length - 1
  const Active = steps[step].Icon

  return (
    <PhoneFrame noBottomPad>
      <div className="flex min-h-dvh flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <CumbrevaLogo size="sm" />
          <div className="flex items-center gap-2">
            <ThemeChoice active={theme === "light"} label="Claro" onClick={() => setTheme("light")} />
            <ThemeChoice active={theme === "dark"} label="Oscuro" onClick={() => setTheme("dark")} />
            {!isLast && (
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="rounded-full px-2 py-1 text-sm text-foreground-muted hover:text-foreground"
              >
                Saltar
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-8 py-8">
          <div className="relative flex h-44 w-44 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-success/10 blur-2xl" />
            <div className="relative flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/90 to-success/70 glow-primary">
              <Active className="h-14 w-14 text-[#00150f]" aria-hidden />
            </div>
          </div>

          <div key={step} className="animate-slide-up text-center">
            <h1 className="mx-auto max-w-[20ch] text-balance text-3xl font-semibold leading-tight tracking-tight">
              {steps[step].title}
            </h1>
            <p className="mx-auto mt-4 max-w-[32ch] text-pretty text-sm leading-relaxed text-foreground-muted">
              {steps[step].text}
            </p>
          </div>

          <div className="flex gap-2" role="tablist" aria-label="Pasos de introduccion">
            {steps.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ir al paso ${i + 1}`}
                aria-selected={i === step}
                onClick={() => setStep(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === step ? "w-8 bg-primary" : "w-1.5 bg-overlay-2",
                )}
              />
            ))}
          </div>

          <div className="w-full rounded-[28px] border border-border bg-card/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-foreground-soft">
              Apariencia desde el inicio
            </p>
            <p className="mt-2 text-sm text-foreground-muted">
              Elige como quieres vivir la app. Este ajuste queda guardado desde el onboarding.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <ThemePreview
                title="Modo claro"
                subtitle="Mas luminoso"
                active={theme === "light"}
                onClick={() => setTheme("light")}
                tone="light"
              />
              <ThemePreview
                title="Modo oscuro"
                subtitle="Menos reflejo"
                active={theme === "dark"}
                onClick={() => setTheme("dark")}
                tone="dark"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pb-2">
          {isLast ? (
            <>
              <Button
                onClick={() => router.push("/registro")}
                className="h-14 w-full rounded-2xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Empezar
              </Button>
              <Button
                asChild
                variant="ghost"
                className="h-12 w-full rounded-2xl text-foreground hover:bg-overlay-hover"
              >
                <Link href="/login">Ya tengo cuenta</Link>
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setStep((s) => s + 1)}
              className="h-14 w-full rounded-2xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Siguiente
            </Button>
          )}
        </div>
      </div>
    </PhoneFrame>
  )
}

function ThemeChoice({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition",
        active
          ? "border-primary/60 bg-primary/10 text-primary"
          : "border-border bg-card text-foreground-muted hover:bg-overlay-hover hover:text-foreground",
      )}
    >
      {label}
    </button>
  )
}

function ThemePreview({
  title,
  subtitle,
  active,
  onClick,
  tone,
}: {
  title: string
  subtitle: string
  active: boolean
  onClick: () => void
  tone: "light" | "dark"
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-[24px] border p-3 text-left transition",
        active ? "border-primary/60 bg-primary/10 ring-2 ring-primary/20" : "border-border bg-background/40",
      )}
    >
      <div
        className={cn(
          "h-20 rounded-[18px] border p-3",
          tone === "light" ? "border-black/10 bg-[#f5f7f9]" : "border-white/10 bg-[#070b10]",
        )}
      >
        <div className={cn("h-3 w-16 rounded-full", tone === "light" ? "bg-black/10" : "bg-white/15")} />
        <div className="mt-3 grid gap-2">
          <div className={cn("h-6 rounded-xl", tone === "light" ? "bg-white shadow-sm" : "bg-white/10")} />
          <div className={cn("h-6 w-3/4 rounded-xl", tone === "light" ? "bg-black/5" : "bg-white/5")} />
        </div>
      </div>
      <p className="mt-3 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-foreground-muted">{subtitle}</p>
    </button>
  )
}
