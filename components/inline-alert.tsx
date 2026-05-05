"use client"

import * as React from "react"
import { AlertTriangle, WifiOff, Plug, UserX, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export type AlertKind = "ocupado" | "sin-conexion" | "incompatible" | "anfitrion" | "info"

const presets: Record<
  AlertKind,
  { Icon: React.ComponentType<{ className?: string }>; tone: string; ring: string; iconBg: string; iconText: string }
> = {
  ocupado: {
    Icon: AlertTriangle,
    tone: "border-warning/30 bg-warning/5",
    ring: "ring-warning/20",
    iconBg: "bg-warning/15",
    iconText: "text-warning",
  },
  "sin-conexion": {
    Icon: WifiOff,
    tone: "border-border bg-card",
    ring: "ring-white/10",
    iconBg: "bg-white/5",
    iconText: "text-foreground-muted",
  },
  incompatible: {
    Icon: Plug,
    tone: "border-destructive/30 bg-destructive/5",
    ring: "ring-destructive/20",
    iconBg: "bg-destructive/15",
    iconText: "text-destructive",
  },
  anfitrion: {
    Icon: UserX,
    tone: "border-warning/30 bg-warning/5",
    ring: "ring-warning/20",
    iconBg: "bg-warning/15",
    iconText: "text-warning",
  },
  info: {
    Icon: AlertTriangle,
    tone: "border-primary/30 bg-primary/5",
    ring: "ring-primary/20",
    iconBg: "bg-primary/15",
    iconText: "text-primary",
  },
}

export function InlineAlert({
  kind,
  title,
  message,
  ctaLabel = "Ver alternativa",
  onCta,
  className,
}: {
  kind: AlertKind
  title?: string
  message: string
  ctaLabel?: string
  onCta?: () => void
  className?: string
}) {
  const p = presets[kind]
  const Icon = p.Icon
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-3xl border p-4 ring-1",
        p.tone,
        p.ring,
        className,
      )}
    >
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl", p.iconBg, p.iconText)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        {title && <p className="text-sm font-semibold">{title}</p>}
        <p className={cn("text-xs leading-relaxed text-foreground-muted", title && "mt-0.5")}>{message}</p>
        {onCta && (
          <button
            type="button"
            onClick={onCta}
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary"
          >
            {ctaLabel} <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  )
}
