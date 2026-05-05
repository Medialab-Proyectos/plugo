import type * as React from "react"
import { cn } from "@/lib/utils"

export function GlassCard({
  className,
  children,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "strong" | "outline"
}) {
  return (
    <div
      className={cn(
        "rounded-3xl p-5",
        variant === "default" && "glass",
        variant === "strong" && "glass-strong",
        variant === "outline" && "border border-border bg-background-secondary/40",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
