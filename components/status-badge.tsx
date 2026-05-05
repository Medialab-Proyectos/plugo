import { cn } from "@/lib/utils"

type Tone = "success" | "warning" | "danger" | "info" | "muted" | "primary"

const toneClasses: Record<Tone, string> = {
  success: "bg-success/15 text-success ring-success/30",
  warning: "bg-warning/15 text-warning ring-warning/30",
  danger: "bg-destructive/15 text-destructive ring-destructive/30",
  info: "bg-primary/15 text-primary ring-primary/30",
  primary: "bg-primary/15 text-primary ring-primary/30",
  muted: "bg-white/5 text-foreground-muted ring-white/10",
}

export function StatusBadge({
  children,
  tone = "muted",
  className,
  withDot,
}: {
  children: React.ReactNode
  tone?: Tone
  className?: string
  withDot?: boolean
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1",
        toneClasses[tone],
        className,
      )}
    >
      {withDot && (
        <span
          className={cn(
            "inline-block h-1.5 w-1.5 rounded-full",
            tone === "success" && "bg-success",
            tone === "warning" && "bg-warning",
            tone === "danger" && "bg-destructive",
            tone === "info" && "bg-primary",
            tone === "primary" && "bg-primary",
            tone === "muted" && "bg-foreground-soft",
          )}
        />
      )}
      {children}
    </span>
  )
}
