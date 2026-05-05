import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function EmptyState({
  Icon,
  title,
  description,
  action,
  className,
}: {
  Icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "glass flex flex-col items-center justify-center rounded-3xl px-6 py-10 text-center",
        className,
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
        <Icon className="h-6 w-6 text-primary" aria-hidden />
      </div>
      <h3 className="text-base font-semibold text-balance">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-[28ch] text-sm text-foreground-muted text-pretty">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
