import { cn } from "@/lib/utils"

export function CumbrevaLogo({
  className,
  showWordmark = true,
  showSlogan = true,
  size = "md",
}: {
  className?: string
  showWordmark?: boolean
  showSlogan?: boolean
  size?: "sm" | "md" | "lg" | "xl"
}) {
  const sizes = {
    sm: { box: "h-8 w-8", text: "text-lg", slogan: "text-[9px]", icon: 18 },
    md: { box: "h-10 w-10", text: "text-2xl", slogan: "text-[10px]", icon: 22 },
    lg: { box: "h-12 w-12", text: "text-3xl", slogan: "text-xs", icon: 26 },
    xl: { box: "h-16 w-16", text: "text-5xl", slogan: "text-sm", icon: 36 },
  }[size]

  // El eslogan solo acompaña al wordmark a partir de tamaño md.
  const withSlogan = showWordmark && showSlogan && size !== "sm"

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center rounded-2xl",
          "bg-gradient-to-br from-primary to-success",
          "glow-primary shadow-[0_0_26px_-4px_var(--primary)]",
          sizes.box,
        )}
      >
        <svg
          width={sizes.icon}
          height={sizes.icon}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"
            fill="#00150F"
            stroke="#00150F"
            strokeWidth="0.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {showWordmark && (
        <div className="flex flex-col items-start leading-none">
          <span className={cn("font-black uppercase tracking-tight text-foreground", sizes.text)}>
            Cumbreva
          </span>
          {withSlogan && (
            <span className={cn("mt-1 font-semibold tracking-wide text-foreground-muted", sizes.slogan)}>
              Tu copiloto eléctrico
            </span>
          )}
        </div>
      )}
    </div>
  )
}
