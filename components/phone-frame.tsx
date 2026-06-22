import type * as React from "react"
import { cn } from "@/lib/utils"

/**
 * AppShell (antes "PhoneFrame") — CUMBREVA
 *
 * Web app responsive, mobile-first. NO simula un marco de celular.
 * - El scroll es el del documento (no un contenedor con altura fija), igual que
 *   una web real: los headers `sticky` funcionan y no hay scroll anidado raro.
 * - En móvil ocupa el 100% del ancho.
 * - En pantallas grandes el contenido se centra en una superficie de app con
 *   borde y sombra sobre el fondo ambiental, para que se vea intencional y
 *   premium en web (no una franja "cortada" en el centro).
 */
export function PhoneFrame({
  children,
  className,
  noBottomPad,
}: {
  children: React.ReactNode
  className?: string
  noBottomPad?: boolean
}) {
  return (
    <div
      className={cn(
        "relative mx-auto flex min-h-dvh w-full max-w-[520px] flex-col bg-background text-foreground",
        // En desktop se lee como una superficie de app centrada, no una franja suelta.
        "sm:my-0 md:border-x md:border-border md:shadow-[0_0_80px_-24px_rgba(0,0,0,0.45)]",
        // Espacio para la nav flotante + safe area
        !noBottomPad && "pb-[calc(5rem+env(safe-area-inset-bottom))]",
        className,
      )}
    >
      {children}
    </div>
  )
}
