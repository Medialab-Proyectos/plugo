"use client"

import * as React from "react"

/**
 * Confeti CSS ligero para micro-celebraciones (reservas, logros).
 * pointer-events-none; respeta prefers-reduced-motion (regla global desactiva la animación).
 */
export function Confetti({ count = 20 }: { count?: number }) {
  const colors = ["#00d86f", "#2ef2a2", "#00f1c7", "#ffd166", "#92ffe7"]
  const pieces = React.useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.3,
        dur: 0.9 + Math.random() * 0.8,
        color: colors[i % colors.length],
        w: 6 + Math.random() * 5,
        rotate: Math.random() * 360,
      })),
    [count],
  )

  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-50 h-0 overflow-visible">
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: 0,
            width: p.w,
            height: p.w * 0.5,
            background: p.color,
            borderRadius: 2,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confetti-fall ${p.dur}s var(--ease-out-expo) ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  )
}
