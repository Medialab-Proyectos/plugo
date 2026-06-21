"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * PageHeader — PLUGO Design System v2
 *
 * iOS-style large title pattern with sticky background blur.
 * Back button uses ghost variant (icon only) → no longer confused with input.
 */
export function PageHeader({
  title,
  subtitle,
  back = true,
  right,
  className,
}: {
  title: string
  subtitle?: string
  back?: boolean
  right?: React.ReactNode
  className?: string
}) {
  const router = useRouter()
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex items-center gap-3 px-5 pb-3 pt-5",
        "bg-background/70 backdrop-blur-xl",
        "[mask-image:linear-gradient(to_bottom,black_85%,transparent)]",
        className,
      )}
    >
      {back && (
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Volver"
          className={cn(
            // Ghost icon button — clearly NOT a card/input
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
            "bg-transparent text-foreground hover:bg-overlay-hover active:scale-95",
            "transition-[transform,background-color] duration-200",
          )}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="truncate text-xs text-foreground-muted">{subtitle}</p>}
      </div>
      {right}
    </header>
  )
}
