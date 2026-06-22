"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { useCumbreva } from "@/lib/cumbreva-context"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const chips = [25, 50, 75, 100]

export function BatteryModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { state, dispatch } = useCumbreva()
  const [value, setValue] = React.useState(state.battery ?? 60)

  React.useEffect(() => {
    if (open) setValue(state.battery ?? 60)
  }, [open, state.battery])

  const handleSave = () => {
    dispatch({ type: "SET_BATTERY", battery: value })
    toast.success("Bateria actualizada", { description: `Referencia: ${value}%` })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[480px] rounded-[28px] border-border bg-popover px-5">
        <DialogHeader>
          <DialogTitle>Actualizar bateria actual</DialogTitle>
          <DialogDescription className="text-foreground-muted">
            Este dato es manual y nos ayuda a mejorar las estimaciones.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 flex flex-col gap-4">
          <div className="rounded-[24px] border border-border bg-card/70 px-4 py-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground-soft">
              Nivel actual
            </p>
            <div className="mt-2 text-5xl font-semibold tabular-nums tracking-tight text-gradient-primary">
              {value}%
            </div>
            <p className="mt-2 text-xs text-foreground-muted">
              Mantiene la misma separacion lateral que el resto de la aplicacion.
            </p>
          </div>

          <div className="rounded-[24px] border border-border bg-card/60 p-4">
            <p className="text-sm font-medium">Desliza o toca un valor rapido</p>
            <p className="mt-1 text-xs text-foreground-muted">
              Asi afinamos recomendaciones de carga, mapa y autonomia real.
            </p>
            <Slider
              value={[value]}
              min={0}
              max={100}
              step={1}
              onValueChange={(v) => setValue(v[0])}
              className="mt-5 w-full"
            />
          </div>

          <div className="grid w-full grid-cols-4 gap-2">
            {chips.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setValue(c)}
                className={cn(
                  "rounded-2xl border px-3 py-3 text-sm transition",
                  value === c
                    ? "border-primary/60 bg-primary/10 text-primary"
                    : "border-border bg-card text-foreground hover:bg-overlay-hover",
                )}
              >
                {c}%
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleSave}
          className="h-12 w-full rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Guardar referencia
        </Button>
      </DialogContent>
    </Dialog>
  )
}
