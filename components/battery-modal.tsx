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
import { usePlugo } from "@/lib/plugo-context"
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
  const { state, dispatch } = usePlugo()
  const [value, setValue] = React.useState(state.battery ?? 60)

  React.useEffect(() => {
    if (open) setValue(state.battery ?? 60)
  }, [open, state.battery])

  const handleSave = () => {
    dispatch({ type: "SET_BATTERY", battery: value })
    toast.success("Batería actualizada", { description: `Referencia: ${value}%` })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl border-border bg-popover">
        <DialogHeader>
          <DialogTitle>Actualizar batería actual</DialogTitle>
          <DialogDescription className="text-foreground-muted">
            Este dato es manual y solo nos ayuda a mejorar las estimaciones.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 flex flex-col items-center gap-4">
          <div className="text-5xl font-semibold tabular-nums tracking-tight text-gradient-primary">
            {value}%
          </div>
          <Slider
            value={[value]}
            min={0}
            max={100}
            step={1}
            onValueChange={(v) => setValue(v[0])}
            className="w-full"
          />
          <div className="flex w-full gap-2">
            {chips.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setValue(c)}
                className={cn(
                  "flex-1 rounded-2xl border px-3 py-2 text-sm transition",
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
