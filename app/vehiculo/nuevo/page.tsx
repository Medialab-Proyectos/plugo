"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Car, Bike, Truck, HelpCircle, Camera, Check, Star } from "lucide-react"
import { toast } from "sonner"
import { PhoneFrame } from "@/components/phone-frame"
import { Stepper } from "@/components/stepper"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { vehicleCatalog } from "@/lib/mock-data"
import { usePlugo } from "@/lib/plugo-context"
import { cn } from "@/lib/utils"

type FormState = {
  type: string
  customType: string
  brand: string
  model: string
  year: string
  manualEntry: boolean
  connector: string
  hasAdapter: boolean
  adapters: string[]
  name: string
  plate: string
  color: string
  range: string
  photo: string | null
}

const initialForm: FormState = {
  type: "",
  customType: "",
  brand: "",
  model: "",
  year: "",
  manualEntry: false,
  connector: "",
  hasAdapter: false,
  adapters: [],
  name: "",
  plate: "",
  color: "",
  range: "",
  photo: null,
}

const types = [
  { id: "auto", label: "Automóvil", Icon: Car },
  { id: "suv", label: "SUV", Icon: Car },
  { id: "camioneta", label: "Camioneta", Icon: Truck },
  { id: "moto", label: "Moto eléctrica", Icon: Bike },
  { id: "otro", label: "Otro vehículo", Icon: HelpCircle },
]

const connectors = [
  { id: "CCS2", label: "CCS2", desc: "Carga rápida estándar en muchas estaciones modernas." },
  { id: "Tipo 2", label: "Tipo 2", desc: "Común en carga AC y puntos residenciales." },
  { id: "CCS1", label: "CCS1", desc: "Usado en algunos vehículos importados." },
  { id: "Tipo 1", label: "Tipo 1", desc: "Frecuente en algunos modelos antiguos o importados." },
  { id: "GB/T", label: "GB/T", desc: "Común en varios vehículos de origen chino." },
  { id: "no-seguro", label: "No estoy seguro", desc: "Te ayudamos a identificarlo más adelante." },
]

const adapterOptions = ["CCS2 a GB/T", "CCS2 a CCS1", "Tipo 2 a Tipo 1", "Otro adaptador"]

const recommendedConnectorByBrand: Record<string, string> = {
  BYD: "CCS2",
  MG: "CCS2",
  Renault: "CCS2",
  Volvo: "CCS2",
  Tesla: "Tipo 2",
  Kia: "CCS2",
  Hyundai: "CCS2",
}

export default function VehicleWizardPage() {
  const router = useRouter()
  const { dispatch } = usePlugo()
  const [step, setStep] = React.useState(1)
  const [form, setForm] = React.useState<FormState>(initialForm)
  const totalSteps = 5

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const canContinue = (() => {
    if (step === 1) return !!form.type && (form.type !== "otro" || form.customType.trim().length > 0)
    if (step === 2) return !!form.brand && !!form.model && !!form.year
    if (step === 3) return !!form.connector
    if (step === 4) return !!form.name.trim() && !!form.plate.trim() && !!form.range
    return true
  })()

  const handleBack = () => {
    if (step === 1) router.back()
    else setStep(step - 1)
  }

  const handleContinue = () => {
    if (step < totalSteps) {
      setStep(step + 1)
      return
    }
  }

  const handleFinish = () => {
    dispatch({
      type: "SET_VEHICLE",
      vehicle: {
        id: "v-" + Date.now(),
        type: form.type === "otro" ? form.customType : form.type,
        customType: form.customType,
        brand: form.brand,
        model: form.model,
        year: form.year,
        connector: form.connector,
        adapters: form.hasAdapter ? form.adapters : [],
        name: form.name,
        plate: form.plate.toUpperCase(),
        color: form.color,
        range: Number(form.range) || 0,
        photo: form.photo,
      },
    })
    dispatch({ type: "ADD_COINS", amount: 50 })
    toast.success("Vehículo registrado", { description: "Ganaste 50 PlugoCoins por completar tu perfil." })
    router.replace("/inicio")
  }

  const recommendedConnector = recommendedConnectorByBrand[form.brand] || null

  return (
    <PhoneFrame noBottomPad>
      <div className="flex min-h-dvh flex-col px-6 pb-8 pt-6">
        <div className="mb-5 flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-card"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <Stepper current={step} total={totalSteps} />
          </div>
        </div>

        <div className="flex-1">
          {step === 1 && (
            <Step1 type={form.type} customType={form.customType} onChange={(t) => update("type", t)} onCustom={(c) => update("customType", c)} />
          )}
          {step === 2 && (
            <Step2
              brand={form.brand}
              model={form.model}
              year={form.year}
              manualEntry={form.manualEntry}
              onChange={(k, v) => update(k as keyof FormState, v as never)}
              setManual={(v) => update("manualEntry", v)}
            />
          )}
          {step === 3 && (
            <Step3
              connector={form.connector}
              hasAdapter={form.hasAdapter}
              adapters={form.adapters}
              recommended={recommendedConnector}
              onConnector={(c) => update("connector", c)}
              onAdapterToggle={(v) => update("hasAdapter", v)}
              onAdapters={(a) => update("adapters", a)}
            />
          )}
          {step === 4 && (
            <Step4
              name={form.name}
              plate={form.plate}
              color={form.color}
              range={form.range}
              photo={form.photo}
              onChange={(k, v) => update(k as keyof FormState, v as never)}
            />
          )}
          {step === 5 && <Step5 form={form} />}
        </div>

        <div className="pt-6">
          {step < totalSteps ? (
            <Button
              onClick={handleContinue}
              disabled={!canContinue}
              className="h-14 w-full rounded-2xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90 disabled:bg-overlay-1 disabled:text-foreground-soft"
            >
              {step === 4 ? "Guardar vehículo" : "Continuar"}
              <ArrowRight className="ml-1 h-5 w-5" />
            </Button>
          ) : (
            <Button
              onClick={handleFinish}
              className="h-14 w-full rounded-2xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Ir al inicio
            </Button>
          )}
        </div>
      </div>
    </PhoneFrame>
  )
}

function StepHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6 animate-slide-up">
      <h1 className="text-balance text-2xl font-semibold leading-tight">{title}</h1>
      {subtitle && <p className="mt-2 text-sm text-foreground-muted">{subtitle}</p>}
    </div>
  )
}

function Step1({
  type,
  customType,
  onChange,
  onCustom,
}: {
  type: string
  customType: string
  onChange: (v: string) => void
  onCustom: (v: string) => void
}) {
  return (
    <>
      <StepHeading title="¿Qué vehículo quieres registrar?" />
      <div className="grid grid-cols-2 gap-3">
        {types.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={cn(
              "flex min-h-[120px] flex-col items-start justify-between rounded-3xl border p-4 text-left transition-all",
              type === id
                ? "border-primary/60 bg-primary/10 ring-2 ring-primary/40"
                : "border-border bg-card hover:bg-overlay-hover",
            )}
            aria-pressed={type === id}
          >
            <Icon
              className={cn("h-7 w-7", type === id ? "text-primary" : "text-foreground-muted")}
              aria-hidden
            />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>
      {type === "otro" && (
        <div className="mt-5 animate-slide-up">
          <Label htmlFor="customType" className="text-foreground-muted">
            Describe tu tipo de vehículo
          </Label>
          <Input
            id="customType"
            value={customType}
            onChange={(e) => onCustom(e.target.value)}
            placeholder="Ej: Microbus eléctrico"
            className="mt-2 h-14"
          />
        </div>
      )}
    </>
  )
}

function Step2({
  brand,
  model,
  year,
  manualEntry,
  onChange,
  setManual,
}: {
  brand: string
  model: string
  year: string
  manualEntry: boolean
  onChange: (k: string, v: string) => void
  setManual: (v: boolean) => void
}) {
  const yearOptions = React.useMemo(
    () => Array.from({ length: 12 }, (_, i) => String(2026 - i)),
    [],
  )
  const brandData = vehicleCatalog.find((b) => b.brand === brand)

  return (
    <>
      <StepHeading title="Cuéntanos qué vehículo tienes" subtitle="Te sugerimos opciones a medida que escribes." />

      {!manualEntry ? (
        <div className="space-y-4">
          <div>
            <Label className="text-foreground-muted">Marca</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {vehicleCatalog.map((b) => (
                <button
                  key={b.brand}
                  type="button"
                  onClick={() => {
                    onChange("brand", b.brand)
                    onChange("model", "")
                  }}
                  className={cn(
                    "rounded-2xl border px-4 py-2 text-sm transition",
                    brand === b.brand
                      ? "border-primary/60 bg-primary/10 text-primary"
                      : "border-border bg-card text-foreground hover:bg-overlay-hover",
                  )}
                >
                  {b.brand}
                </button>
              ))}
            </div>
          </div>

          {brandData && (
            <div className="animate-slide-up">
              <Label className="text-foreground-muted">Modelo</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {brandData.models.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => onChange("model", m)}
                    className={cn(
                      "rounded-2xl border px-4 py-2 text-sm transition",
                      model === m
                        ? "border-primary/60 bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground hover:bg-overlay-hover",
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}

          {model && (
            <div className="animate-slide-up">
              <Label className="text-foreground-muted">Año</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {yearOptions.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => onChange("year", y)}
                    className={cn(
                      "rounded-2xl border px-4 py-2 text-sm transition",
                      year === y
                        ? "border-primary/60 bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground hover:bg-overlay-hover",
                    )}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setManual(true)}
            className="text-sm text-primary hover:underline"
          >
            No encuentro mi vehículo
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <Label htmlFor="brand" className="text-foreground-muted">
              Marca
            </Label>
            <Input
              id="brand"
              value={brand}
              onChange={(e) => onChange("brand", e.target.value)}
              className="mt-2 h-14"
            />
          </div>
          <div>
            <Label htmlFor="model" className="text-foreground-muted">
              Modelo
            </Label>
            <Input
              id="model"
              value={model}
              onChange={(e) => onChange("model", e.target.value)}
              className="mt-2 h-14"
            />
          </div>
          <div>
            <Label htmlFor="year" className="text-foreground-muted">
              Año
            </Label>
            <Input
              id="year"
              type="number"
              value={year}
              onChange={(e) => onChange("year", e.target.value)}
              className="mt-2 h-14"
            />
          </div>
          <p className="text-xs text-foreground-muted">
            Si tu vehículo no aparece, puedes registrarlo manualmente.
          </p>
          <button
            type="button"
            onClick={() => setManual(false)}
            className="text-sm text-primary hover:underline"
          >
            Volver a buscar marcas
          </button>
        </div>
      )}
    </>
  )
}

function Step3({
  connector,
  hasAdapter,
  adapters,
  recommended,
  onConnector,
  onAdapterToggle,
  onAdapters,
}: {
  connector: string
  hasAdapter: boolean
  adapters: string[]
  recommended: string | null
  onConnector: (c: string) => void
  onAdapterToggle: (v: boolean) => void
  onAdapters: (a: string[]) => void
}) {
  return (
    <>
      <StepHeading title="Selecciona el conector de tu vehículo" subtitle="Esto nos ayuda a mostrar más electrolineras compatibles en el mapa." />
      <div className="space-y-2">
        {connectors.map((c) => {
          const isRecommended = recommended === c.id
          const selected = connector === c.id
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onConnector(c.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-3xl border p-4 text-left transition",
                selected ? "border-primary/60 bg-primary/10" : "border-border bg-card hover:bg-overlay-hover",
              )}
              aria-pressed={selected}
            >
              <div
                className={cn(
                  "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border",
                  selected ? "border-primary bg-primary" : "border-foreground-soft",
                )}
              >
                {selected && <Check className="h-3 w-3 text-primary-foreground" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{c.label}</span>
                  {isRecommended && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-medium text-warning">
                      <Star className="h-3 w-3" /> Recomendado para tu vehículo
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-foreground-muted">{c.desc}</p>
              </div>
            </button>
          )
        })}
      </div>

      {connector === "no-seguro" && (
        <GlassCard className="mt-4 animate-slide-up">
          <p className="text-sm text-foreground">
            Te ayudaremos a encontrar electrolineras compatibles según tu vehículo.
          </p>
        </GlassCard>
      )}

      <div className="mt-6 space-y-3">
        <Label className="text-foreground-muted">¿Usas adaptador?</Label>
        <div className="flex gap-2">
          {[
            { v: false, label: "No" },
            { v: true, label: "Sí" },
          ].map((o) => (
            <button
              key={String(o.v)}
              type="button"
              onClick={() => onAdapterToggle(o.v)}
              className={cn(
                "flex-1 rounded-2xl border px-4 py-3 text-sm transition",
                hasAdapter === o.v
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground hover:bg-overlay-hover",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>

        {hasAdapter && (
          <div className="space-y-2 animate-slide-up">
            {adapterOptions.map((a) => {
              const checked = adapters.includes(a)
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() =>
                    onAdapters(checked ? adapters.filter((x) => x !== a) : [...adapters, a])
                  }
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition",
                    checked ? "border-primary/60 bg-primary/10" : "border-border bg-card hover:bg-overlay-hover",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-md border",
                      checked ? "border-primary bg-primary" : "border-foreground-soft",
                    )}
                  >
                    {checked && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  <span className="text-sm">{a}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

function Step4({
  name,
  plate,
  color,
  range,
  photo,
  onChange,
}: {
  name: string
  plate: string
  color: string
  range: string
  photo: string | null
  onChange: (k: string, v: string | null) => void
}) {
  const [cameraOpen, setCameraOpen] = React.useState(false)

  return (
    <>
      <StepHeading title="Personaliza tu vehículo" />
      <div className="space-y-4">
        <div>
          <Label htmlFor="vname" className="text-foreground-muted">Nombre del vehículo</Label>
          <Input
            id="vname"
            value={name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Mi BYD Seagull"
            className="mt-2 h-14"
          />
        </div>
        <div>
          <Label htmlFor="plate" className="text-foreground-muted">Placa</Label>
          <Input
            id="plate"
            value={plate}
            onChange={(e) => onChange("plate", e.target.value.toUpperCase())}
            placeholder="ABC123"
            className="mt-2 h-14 uppercase tracking-widest"
          />
          <p className="mt-1.5 text-xs text-foreground-soft">Detección de placa próximamente.</p>
        </div>
        <div>
          <Label htmlFor="color" className="text-foreground-muted">Color</Label>
          <Input
            id="color"
            value={color}
            onChange={(e) => onChange("color", e.target.value)}
            placeholder="Plata, Negro, Blanco..."
            className="mt-2 h-14"
          />
        </div>
        <div>
          <Label htmlFor="range" className="text-foreground-muted">Autonomía máxima al 100%</Label>
          <div className="mt-2 flex items-center gap-2">
            <Input
              id="range"
              type="number"
              value={range}
              onChange={(e) => onChange("range", e.target.value)}
              placeholder="380"
              className="h-14 flex-1 rounded-2xl border-border bg-card text-base"
            />
            <span className="text-sm text-foreground-muted">km</span>
          </div>
          <p className="mt-1.5 text-xs text-foreground-soft">
            Este dato viene del fabricante y nos ayuda a estimar rutas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCameraOpen(true)}
          className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-border bg-card/50 p-4 text-left text-sm text-foreground-muted hover:bg-overlay-hover"
        >
          <Camera className="h-5 w-5" />
          {photo ? "Cambiar foto del vehículo" : "Tomar foto de mi vehículo"}
        </button>
        {photo && (
          <p className="text-xs text-foreground-soft">
            Esta foto es solo para personalizar tu experiencia.
          </p>
        )}
      </div>

      {cameraOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="glass-strong w-full max-w-sm rounded-3xl p-6">
            <div className="map-pattern mb-4 flex aspect-square items-center justify-center rounded-2xl border border-border">
              <Camera className="h-12 w-12 text-foreground-muted" />
            </div>
            <p className="mb-4 text-center text-sm text-foreground-muted">
              Toma una foto referencial. No se sube a ningún servidor.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => setCameraOpen(false)}
                className="h-12 rounded-2xl border-border bg-card hover:bg-overlay-hover"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  onChange("photo", "/vehicle-byd-seagull-side-dark.jpg")
                  setCameraOpen(false)
                }}
                className="h-12 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Usar foto
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Step5({ form }: { form: FormState }) {
  return (
    <>
      <StepHeading title="Tu vehículo está listo." subtitle="Revisa los datos antes de continuar." />
      <GlassCard variant="strong" className="overflow-hidden p-0">
        <div className="map-pattern relative aspect-[16/9] w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={form.photo || "/vehicle-byd-seagull-side-dark.jpg"}
            alt={form.name || "Vehículo"}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
        <div className="space-y-3 p-5">
          <Row label="Nombre" value={form.name || "Sin nombre"} />
          <Row label="Placa" value={form.plate || "—"} mono />
          <Row label="Marca y modelo" value={`${form.brand} ${form.model} ${form.year}`} />
          <Row label="Conector principal" value={form.connector || "—"} />
          <Row label="Adaptadores" value={form.hasAdapter && form.adapters.length ? form.adapters.join(", ") : "Ninguno"} />
          <Row label="Autonomía máxima" value={`${form.range || 0} km`} />
        </div>
      </GlassCard>
      <GlassCard className="mt-4 flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-success/15 text-success">
          <Check className="h-4 w-4" />
        </div>
        <div className="text-sm">
          <p className="font-medium">Ganaste 50 PlugoCoins</p>
          <p className="text-xs text-foreground-muted">Por completar el registro de tu vehículo.</p>
        </div>
      </GlassCard>
    </>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-2 last:border-0 last:pb-0">
      <span className="text-xs uppercase tracking-wider text-foreground-soft">{label}</span>
      <span className={cn("text-sm font-medium text-right", mono && "font-mono")}>{value}</span>
    </div>
  )
}
