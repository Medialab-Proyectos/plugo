"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CarFront, Grid2X2, Home, MapPinned, UserCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { href: "/inicio", label: "Inicio", Icon: Home },
  { href: "/mapa", label: "Mapa", Icon: MapPinned },
  { href: "/servicios", label: "Explora", Icon: Grid2X2 },
  { href: "/mi-vehiculo", label: "Vehículos", Icon: CarFront },
  { href: "/perfil", label: "Perfil", Icon: UserCircle },
]

export function BottomNav() {
  const pathname = usePathname()
  const activeIndex = Math.max(
    0,
    tabs.findIndex((t) => pathname === t.href || pathname.startsWith(t.href + "/")),
  )

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 px-4 pb-[max(env(safe-area-inset-bottom),12px)]"
    >
      <div className="glass-strong relative grid grid-cols-5 rounded-full shadow-[0_12px_40px_-16px_rgba(0,0,0,0.5)]">
        {/* Indicador activo deslizante (spring) */}
        <span
          aria-hidden
          className="nav-indicator pointer-events-none absolute inset-y-1.5 left-0 w-1/5"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        >
          <span className="block h-full rounded-full bg-primary/15 ring-1 ring-inset ring-primary/25 mx-1.5" />
        </span>

        {tabs.map(({ href, label, Icon }, i) => {
          const active = i === activeIndex
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative z-10 flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-full px-1 py-2",
                "transition-[color,transform] duration-200 active:scale-90",
                active ? "text-primary" : "text-foreground-muted hover:text-foreground",
              )}
            >
              <Icon
                className={cn("h-[22px] w-[22px] transition-transform duration-200", active && "scale-105")}
                strokeWidth={active ? 2.4 : 2}
                aria-hidden
              />
              <span className={cn("text-[10px] leading-none", active ? "font-semibold" : "font-medium")}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
