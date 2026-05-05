"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Car, Home, Map, Navigation, User } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { href: "/inicio", label: "Inicio", Icon: Home },
  { href: "/mapa", label: "Mapa", Icon: Map },
  { href: "/rutas", label: "Rutas", Icon: Navigation },
  { href: "/mi-vehiculo", label: "Vehículo", Icon: Car },
  { href: "/perfil", label: "Perfil", Icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-[520px] -translate-x-1/2 px-4 pb-[max(env(safe-area-inset-bottom),10px)]"
    >
      <div className="flex min-h-[56px] items-center justify-around rounded-2xl border border-border bg-background/90 px-1 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
        {tabs.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/")

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-h-[48px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 transition-all duration-200 active:scale-95",
                active ? "text-[#00d86f]" : "text-foreground-soft hover:text-foreground-muted",
              )}
            >
              <Icon className={cn("h-[20px] w-[20px]", active && "fill-current")} aria-hidden />
              <span className={cn("text-[10px] leading-none", active ? "font-semibold" : "font-medium")}>
                {label}
              </span>
              {active && (
                <span
                  aria-hidden
                  className="h-[4px] w-[4px] rounded-full bg-[#00d86f]"
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
