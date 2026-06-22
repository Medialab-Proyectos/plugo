"use client"

import * as React from "react"
import { Heart } from "lucide-react"
import { toast } from "sonner"
import { useCumbreva } from "@/lib/cumbreva-context"
import { cn } from "@/lib/utils"

export function FavoriteButton({
  serviceId,
  serviceName,
  className,
  size = 38,
}: {
  serviceId: string
  serviceName?: string
  className?: string
  size?: number
}) {
  const { state, dispatch } = useCumbreva()
  const isFav = state.favoriteServices.includes(serviceId)

  const onToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dispatch({ type: "TOGGLE_FAVORITE", serviceId })
    if (isFav) {
      toast("Quitado de favoritos", {
        description: serviceName ? `Ya no verás ${serviceName} en tu lista.` : undefined,
      })
    } else {
      toast.success("Guardado en favoritos", {
        description: serviceName ? `${serviceName} estará disponible en tu lista.` : undefined,
      })
    }
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isFav}
      aria-label={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
      className={cn(
        "flex items-center justify-center rounded-full border transition active:scale-95",
        isFav
          ? "border-primary/60 bg-primary/15 text-primary"
          : "border-border bg-card/80 text-foreground-muted backdrop-blur-md hover:text-foreground",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Heart className={cn("h-4 w-4", isFav && "fill-primary")} />
    </button>
  )
}
