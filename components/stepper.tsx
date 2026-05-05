import { cn } from "@/lib/utils"

export function Stepper({
  current,
  total,
  label,
}: {
  current: number
  total: number
  label?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
          Paso {current} de {total}
        </span>
        {label && <span className="text-xs text-foreground-muted">{label}</span>}
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all",
              i < current ? "bg-primary" : "bg-white/10",
            )}
          />
        ))}
      </div>
    </div>
  )
}
