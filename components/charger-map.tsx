"use client"

import * as React from "react"
import { Zap, Navigation, Plus, Minus, Crosshair } from "lucide-react"
import type { Charger } from "@/lib/mock-data"
import { chargerProbability, probabilityLevel, probabilityClasses } from "@/lib/decision"
import { cn } from "@/lib/utils"

export function ChargerMap({
  chargers,
  selectedId,
  onSelect,
}: {
  chargers: Charger[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div
      className="relative h-full w-full overflow-hidden map-pattern"
      role="img"
      aria-label="Mapa con electrolineras cercanas"
    >
      {/* Mock streets */}
      <svg className="absolute inset-0 h-full w-full opacity-30" aria-hidden>
        <line x1="0" y1="30%" x2="100%" y2="35%" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
        <line x1="20%" y1="0" x2="22%" y2="100%" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
        <line x1="0" y1="65%" x2="100%" y2="60%" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
        <line x1="60%" y1="0" x2="55%" y2="100%" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
        <path
          d="M 0 80% Q 30% 70%, 50% 75% T 100% 70%"
          fill="none"
          stroke="rgba(0,241,199,0.15)"
          strokeWidth="2"
        />
      </svg>

      {/* user location */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <div className="absolute inset-0 -m-3 animate-cumbreva-glow rounded-full bg-primary/30" />
          <div className="relative h-4 w-4 rounded-full bg-primary ring-4 ring-background" />
        </div>
      </div>

      {/* Pins */}
      {chargers.map((c) => {
        const isSelected = selectedId === c.id
        const prob = chargerProbability(c)
        const lvl = probabilityLevel(prob)
        const cls = probabilityClasses[lvl]
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-full transition-transform",
              isSelected && "scale-110 z-20",
            )}
            style={{ left: `${c.mapX}%`, top: `${c.mapY}%` }}
            aria-label={`${c.name}, ${prob}% de disponibilidad`}
          >
            <div
              className={cn(
                "relative flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-background",
                cls.dot,
                c.type === "privado" && "ring-blue-400/60",
              )}
            >
              <Zap className="h-4 w-4 text-[#00150F]" strokeWidth={2.5} />
              {isSelected && <span className="absolute inset-0 -m-1 animate-ping rounded-full bg-primary/30" />}
            </div>
            <div
              className={cn(
                "absolute left-1/2 top-full mt-1 h-2 w-2 -translate-x-1/2 rotate-45",
                cls.dot,
              )}
            />
            {/* Probability badge */}
            <div
              className={cn(
                "absolute -right-1 -top-1 flex h-4 min-w-[18px] items-center justify-center rounded-full px-1 text-[9px] font-bold ring-2 ring-background",
                cls.bg,
                cls.text,
              )}
            >
              {prob}
            </div>
          </button>
        )
      })}

      {/* Map controls */}
      <div className="absolute right-3 top-3 flex flex-col gap-2">
        <button
          type="button"
          aria-label="Centrar en mi ubicación"
          className="glass-strong flex h-10 w-10 items-center justify-center rounded-2xl text-foreground"
        >
          <Crosshair className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Acercar"
          className="glass-strong flex h-10 w-10 items-center justify-center rounded-2xl text-foreground"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Alejar"
          className="glass-strong flex h-10 w-10 items-center justify-center rounded-2xl text-foreground"
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>

      {/* Compass */}
      <div className="absolute right-3 bottom-32 glass-strong flex h-10 w-10 items-center justify-center rounded-2xl">
        <Navigation className="h-4 w-4 text-primary" />
      </div>
    </div>
  )
}
