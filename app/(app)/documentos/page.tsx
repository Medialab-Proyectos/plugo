"use client"

import * as React from "react"
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  FileText,
  Plus,
  Shield,
  Upload,
  Wrench,
  IdCard,
  LifeBuoy,
} from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StatusBadge } from "@/components/status-badge"
import { documentTemplates } from "@/lib/mock-data"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  soat: Shield,
  "todo-riesgo": Shield,
  tecnomec: Wrench,
  asistencia: LifeBuoy,
  licencia: IdCard,
}

const statusMap: Record<
  string,
  { label: string; tone: "success" | "warning" | "danger" | "muted" }
> = {
  vigente: { label: "Vigente", tone: "success" },
  "por-vencer": { label: "Por vencer", tone: "warning" },
  vencido: { label: "Vencido", tone: "danger" },
  "no-cargado": { label: "No cargado", tone: "muted" },
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null
  const today = new Date()
  const target = new Date(iso)
  const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

export default function DocumentosPage() {
  const [open, setOpen] = React.useState(false)

  const docs = documentTemplates
  const alerts = docs.filter((d) => d.status === "por-vencer" || d.status === "vencido" || d.status === "no-cargado")
  const vigentes = docs.filter((d) => d.status === "vigente")

  return (
    <div className="space-y-5 px-5 pb-6 pt-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">Garaje legal</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Documentos</h1>
          <p className="mt-1 text-xs text-foreground-muted">Todo bajo control con alertas inteligentes.</p>
        </div>
        <Button size="sm" className="rounded-2xl" onClick={() => setOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Subir
        </Button>
      </header>

      {alerts.length > 0 && (
        <GlassCard className="border-warning/40 bg-warning/5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-warning/15 text-warning">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Atención requerida</p>
              <p className="mt-0.5 text-xs text-foreground-muted">
                Tienes {alerts.length} documento{alerts.length !== 1 ? "s" : ""} que necesitan revisión.
              </p>
              {alerts.slice(0, 2).map((d) => {
                const days = daysUntil(d.expiresAt)
                return (
                  <p key={d.id} className="mt-2 text-xs text-foreground">
                    {d.status === "vencido" && days !== null && `Tu ${d.name} venció hace ${Math.abs(days)} días.`}
                    {d.status === "por-vencer" && days !== null && `Tu ${d.name} vence en ${days} días.`}
                    {d.status === "no-cargado" && `Aún no has cargado tu ${d.name}.`}
                  </p>
                )
              })}
            </div>
          </div>
        </GlassCard>
      )}

      <Tabs defaultValue="todos" className="w-full">
        <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-card">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="vigentes">Vigentes</TabsTrigger>
          <TabsTrigger value="alertas">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="mt-4 space-y-3">
          {docs.map((d) => (
            <DocumentRow key={d.id} doc={d} />
          ))}
        </TabsContent>

        <TabsContent value="vigentes" className="mt-4 space-y-3">
          {vigentes.length === 0 ? (
            <EmptyDocs message="Aún no tienes documentos vigentes." />
          ) : (
            vigentes.map((d) => <DocumentRow key={d.id} doc={d} />)
          )}
        </TabsContent>

        <TabsContent value="alertas" className="mt-4 space-y-3">
          {alerts.length === 0 ? (
            <GlassCard className="text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
              <p className="mt-3 text-sm font-semibold">Todo en orden</p>
              <p className="mt-1 text-xs text-foreground-muted">No hay documentos por vencer.</p>
            </GlassCard>
          ) : (
            alerts.map((d) => <DocumentRow key={d.id} doc={d} />)
          )}
        </TabsContent>
      </Tabs>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl border-border bg-popover">
          <SheetHeader className="text-left">
            <SheetTitle>Subir documento</SheetTitle>
            <SheetDescription className="text-foreground-muted">
              Toma una foto o sube un PDF y lo asociamos a tu vehículo.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="doc-type" className="text-xs uppercase tracking-widest text-foreground-soft">
                Tipo de documento
              </Label>
              <select
                id="doc-type"
                className="h-11 w-full rounded-2xl border border-border bg-input px-3 text-sm"
              >
                <option>SOAT</option>
                <option>Revisión técnico-mecánica</option>
                <option>Seguro todo riesgo</option>
                <option>Asistencia en carretera</option>
                <option>Licencia de conducción</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="doc-expiry" className="text-xs uppercase tracking-widest text-foreground-soft">
                Fecha de vencimiento
              </Label>
              <Input id="doc-expiry" type="date" className="h-11 rounded-2xl" />
            </div>
            <button
              type="button"
              className="flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-card px-4 py-8 text-center transition hover:border-primary/50"
            >
              <Upload className="h-8 w-8 text-primary" />
              <p className="text-sm font-semibold">Subir archivo o tomar foto</p>
              <p className="text-xs text-foreground-muted">PDF, JPG o PNG · máx. 10 MB</p>
            </button>
            <Button
              onClick={() => {
                setOpen(false)
                toast.success("Documento guardado", { description: "Te avisaremos cuando esté por vencer." })
              }}
              className="h-12 w-full rounded-2xl bg-primary text-primary-foreground"
            >
              Guardar documento
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function EmptyDocs({ message }: { message: string }) {
  return (
    <GlassCard className="text-center">
      <FileText className="mx-auto h-8 w-8 text-foreground-muted" />
      <p className="mt-2 text-sm text-foreground-muted">{message}</p>
    </GlassCard>
  )
}

function DocumentRow({ doc }: { doc: (typeof documentTemplates)[number] }) {
  const Icon = iconMap[doc.id] || FileText
  const status = statusMap[doc.status]
  const days = daysUntil(doc.expiresAt)
  const subtitle =
    doc.status === "vencido" && days !== null
      ? `Vencido hace ${Math.abs(days)} días`
      : doc.status === "por-vencer" && days !== null
        ? `Vence en ${days} días`
        : doc.status === "vigente" && days !== null
          ? `Vigente · vence ${formatDate(doc.expiresAt!)}`
          : "Aún no has cargado este documento"

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-3 rounded-3xl border bg-card p-4 text-left transition active:scale-[0.99]",
        doc.status === "vencido" ? "border-destructive/30" : "border-border",
      )}
    >
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
          doc.status === "vigente" && "bg-success/15 text-success",
          doc.status === "por-vencer" && "bg-warning/15 text-warning",
          doc.status === "vencido" && "bg-destructive/15 text-destructive",
          doc.status === "no-cargado" && "bg-overlay-1 text-foreground-muted",
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{doc.name}</p>
        <p className="mt-0.5 truncate text-[11px] text-foreground-muted">{subtitle}</p>
      </div>
      <StatusBadge tone={status.tone} withDot>
        {status.label}
      </StatusBadge>
      <ChevronRight className="h-4 w-4 text-foreground-muted" />
    </button>
  )
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", year: "numeric" }).format(
      new Date(iso),
    )
  } catch {
    return iso
  }
}
