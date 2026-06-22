"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PhoneFrame } from "@/components/phone-frame"
import { CumbrevaLogo } from "@/components/cumbreva-logo"
import { Compass, CalendarCheck, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
  {
    Icon: Compass,
    title: "Tu carro eléctrico, sin incertidumbre",
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
  const isLast = step === steps.length - 1
  const Active = steps[step].Icon

  return (
    <PhoneFrame noBottomPad>
      <div className="flex min-h-dvh flex-col p-6">
        <div className="flex items-center justify-between">
          <CumbrevaLogo size="sm" />
          {!isLast && (
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-sm text-foreground-muted hover:text-foreground"
            >
              Saltar
            </button>
          )}
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-10 py-8">
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

          <div className="flex gap-2" role="tablist" aria-label="Pasos de introducción">
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
