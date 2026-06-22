"use client"

import { usePathname } from "next/navigation"

/**
 * Transición sutil entre pantallas. Se re-monta al cambiar de ruta (key),
 * disparando `animate-page-in`. Respeta prefers-reduced-motion (regla global).
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div key={pathname} className="animate-page-in min-h-full">
      {children}
    </div>
  )
}
