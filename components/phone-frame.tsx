import type * as React from "react"
import { cn } from "@/lib/utils"

/**
 * AppShell (antes "PhoneFrame") — PLUGO
 *
 * Web app responsive, mobile-first. El SHELL ocupa todo el ancho de la ventana
 * (fondo continuo, sin simular un marco de celular). El contenido se centra en
 * una columna fluida cómoda para lectura en pantallas anchas y ocupa el 100%
 * del ancho en móvil.
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
    <div className={cn("relative flex h-dvh w-full flex-col overflow-y-auto bg-background text-foreground", className)}>
      <div
        className={cn(
          "mx-auto flex min-h-full w-full max-w-[480px] flex-1 flex-col",
          // Espacio para la nav flotante + safe area
          !noBottomPad && "pb-[calc(5rem+env(safe-area-inset-bottom))]",
        )}
      >
        {children}
      </div>
    </div>
  )
}
