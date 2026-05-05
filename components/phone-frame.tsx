import type * as React from "react"
import { cn } from "@/lib/utils"

/**
 * PhoneFrame — PLUGO Design System v2
 *
 * Mobile-first: the app always takes the full viewport edge-to-edge
 * on all screen sizes for true responsive behavior.
 */
export function PhoneFrame({
  children,
  className,
  noBottomPad,
}: {
  children: React.ReactNode
  className?: string
  noBottomPad?: boolean
}) {
  return (
    <div
      className={cn(
        "relative mx-auto flex h-dvh w-full max-w-[520px] flex-col overflow-y-auto bg-background",
        // Bottom padding: floating nav (56px) + bottom margin (10px) + safe area
        !noBottomPad && "pb-[calc(5rem+env(safe-area-inset-bottom))]",
        className,
      )}
    >
      {children}
    </div>
  )
}
