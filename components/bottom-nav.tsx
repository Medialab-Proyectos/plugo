"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CarFront, Grid2X2, Home, MapPinned, UserCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { CumbrevaLogo } from "@/components/cumbreva-logo"

const tabs = [
  { href: "/inicio", label: "Inicio", Icon: Home },
  { href: "/mapa", label: "Mapa", Icon: MapPinned },
  { href: "/servicios", label: "Explora", Icon: Grid2X2 },
  { href: "/mi-vehiculo", label: "Vehiculos", Icon: CarFront },
  { href: "/perfil", label: "Perfil", Icon: UserCircle },
]

/**
 * Navegación responsive de CUMBREVA.
 * · Desktop (md+): sidebar lateral fija a la izquierda — la app se ve como una web app.
 * · Móvil: barra inferior flotante.
 */
export function BottomNav() {
  const pathname = usePathname()
  const activeIndex = Math.max(
    0,
    tabs.findIndex((t) => pathname === t.href || pathname.startsWith(t.href + "/")),
  )

  return (
    <>
      {/* ───────── Sidebar (desktop) ───────── */}
      <aside className="fixed left-0 top-0 z-40 hidden h-dvh w-[240px] flex-col border-r border-border bg-background/85 px-4 py-6 backdrop-blur-xl md:flex">
        <Link href="/inicio" className="flex items-center px-2">
          <CumbrevaLogo size="lg" />
        </Link>

        <nav aria-label="Navegación principal" className="mt-8 flex flex-col gap-1">
          {tabs.map(({ href, label, Icon }, i) => {
            const active = i === activeIndex
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-colors",
                  active
                    ? "bg-primary/12 text-primary"
                    : "text-foreground-muted hover:bg-overlay-hover hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2.4 : 2} aria-hidden />
                {label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* ───────── Barra inferior (móvil) ───────── */}
      <nav
        aria-label="Navegación principal"
        className="fixed bottom-0 left-1/2 z-40 w-full max-w-[520px] -translate-x-1/2 px-4 pb-[max(env(safe-area-inset-bottom),12px)] md:hidden"
      >
        <div className="relative grid grid-cols-5 rounded-full border border-border bg-popover/90 shadow-[0_12px_36px_-24px_rgba(11,22,34,0.55)] backdrop-blur-xl">
          <span
            aria-hidden
            className="nav-indicator pointer-events-none absolute inset-y-1.5 left-0 w-1/5"
            style={{ transform: `translateX(${activeIndex * 100}%)` }}
          >
            <span className="mx-1.5 block h-full rounded-full bg-primary/18 ring-1 ring-inset ring-primary/35" />
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
    </>
  )
}
