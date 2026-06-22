import type * as React from "react"
import { BottomNav } from "@/components/bottom-nav"
import { PageTransition } from "@/components/page-transition"

/**
 * Shell responsive de CUMBREVA (web app, no marco de celular).
 * · Móvil: contenido a todo el ancho + barra inferior.
 * · Desktop: sidebar lateral fija + contenido desplazado a la derecha que usa el ancho.
 */
export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh w-full bg-background text-foreground">
      <BottomNav />
      {/* Aire inferior en móvil para la barra de nav flotante; en desktop la nav es lateral. */}
      <div className="pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0 md:pl-[240px]">
        <PageTransition>{children}</PageTransition>
      </div>
    </div>
  )
}
