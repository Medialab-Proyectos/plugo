"use client"

import * as React from "react"

/**
 * Anima un número de 0 a `target` con easing (ease-out-cubic).
 * Respeta `prefers-reduced-motion`: si está activo, asigna el valor final al instante.
 */
export function useCountUp(target: number, duration = 1000): number {
  const [value, setValue] = React.useState(0)

  React.useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setValue(target)
      return
    }

    let raf = 0
    const start = performance.now()
    const from = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(from + (target - from) * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return value
}
