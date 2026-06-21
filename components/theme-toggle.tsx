"use client"

import type { MouseEvent } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/lib/theme-context"
import { cn } from "@/lib/utils"

/**
 * Toggle claro/oscuro con transición de íconos.
 * Por defecto hereda color del contenedor; pásale `className` para temas sobre fondos de marca.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme()
  const dark = theme === "dark"

  function onToggle(event: MouseEvent<HTMLButtonElement>) {
    const x = event.clientX
    const y = event.clientY
    const radius = Math.ceil(Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)))
    document.documentElement.style.setProperty("--theme-x", `${x}px`)
    document.documentElement.style.setProperty("--theme-y", `${y}px`)
    document.documentElement.style.setProperty("--theme-radius", `${radius}px`)

    const doc = document as Document & {
      startViewTransition?: (callback: () => void) => { ready: Promise<void> }
    }

    if (!doc.startViewTransition) {
      toggle()
      return
    }

    doc.startViewTransition(() => {
      toggle()
    })
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={dark ? "Activar modo claro" : "Activar modo oscuro"}
      aria-pressed={!dark}
      className={cn(
        "relative grid h-10 w-10 place-items-center overflow-hidden rounded-full transition active:scale-90",
        className,
      )}
    >
      <Sun
        className={cn(
          "absolute h-5 w-5 transition-all duration-300",
          dark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0",
        )}
      />
      <Moon
        className={cn(
          "absolute h-5 w-5 transition-all duration-300",
          dark ? "-rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100",
        )}
      />
    </button>
  )
}
