import { cn } from "@/lib/utils"

export function PlugoLogo({
  className,
  showWordmark = true,
  size = "md",
}: {
  className?: string
  showWordmark?: boolean
  size?: "sm" | "md" | "lg" | "xl"
}) {
  const sizes = {
    sm: { box: "h-7 w-7", text: "text-base", icon: 16 },
    md: { box: "h-9 w-9", text: "text-xl", icon: 20 },
    lg: { box: "h-12 w-12", text: "text-2xl", icon: 26 },
    xl: { box: "h-16 w-16", text: "text-4xl", icon: 36 },
  }[size]

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-2xl",
          "bg-gradient-to-br from-primary/90 to-success/80",
          "glow-primary",
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
        <span className={cn("font-semibold tracking-tight text-foreground", sizes.text)}>
          PLUGO
        </span>
      )}
    </div>
  )
}
