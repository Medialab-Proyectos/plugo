"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  Camera,
  Car,
  Check,
  HelpCircle,
  Star,
  Truck,
} from "lucide-react"
import { toast } from "sonner"
import { PhoneFrame } from "@/components/phone-frame"
import { Stepper } from "@/components/stepper"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { vehicleCatalog } from "@/lib/mock-data"
import { useCumbreva } from "@/lib/cumbreva-context"
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
  { id: "auto", label: "Automovil", Icon: Car },
  { id: "suv", label: "SUV", Icon: Car },
  { id: "camioneta", label: "Camioneta", Icon: Truck },
  { id: "moto", label: "Moto electrica", Icon: Bike },
  { id: "otro", label: "Otro vehiculo", Icon: HelpCircle },
]

const connectors = [
  { id: "CCS2", label: "CCS2", desc: "Carga rapida comun en estaciones modernas." },
  { id: "Tipo 2", label: "Tipo 2", desc: "Muy usado en carga AC y puntos residenciales." },
  { id: "CCS1", label: "CCS1", desc: "Comun en algunos vehiculos importados." },
  { id: "Tipo 1", label: "Tipo 1", desc: "Se ve en modelos mas antiguos o importados." },
  { id: "GB/T", label: "GB/T", desc: "Presente en varios vehiculos de origen chino." },
  { id: "no-seguro", label: "No estoy seguro", desc: "Luego te ayudamos a identificarlo." },
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
  const { dispatch } = useCumbreva()
  const [step, setStep] = React.useState(1)
  const [form, setForm] = React.useState<FormState>(initialForm)
  const totalSteps = 5
  const recommendedConnector = recommendedConnectorByBrand[form.brand] || null

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }))

  const canContinue = (() => {
    if (step === 1) return !!form.type && (form.type !== "otro" || form.customType.trim().length > 0)
    if (step === 2) return !!form.brand.trim() && !!form.model.trim() && !!form.year.trim()
    if (step === 3) return !!form.connector
    if (step === 4) return !!form.name.trim() && !!form.plate.trim() && !!form.range.trim()
    return true
  })()

  const handleBack = () => {
    if (step === 1) {
      router.back()
      return
    }
    setStep((current) => current - 1)
  }

  const handleContinue = () => {
    if (step < totalSteps) setStep((current) => current + 1)
  }

  const handleFinish = () => {
    dispatch({
      type: "ADD_VEHICLE",
      vehicle: {
        id: `v-${Date.now()}`,
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
    toast.success("Vehiculo registrado", {
      description: "Ganaste 50 CumbrevaCoins por completar tu perfil.",
    })
    router.replace("/inicio")
  }

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
            <Step1
              type={form.type}
              customType={form.customType}
              onChange={(value) => update("type", value)}
              onCustom={(value) => update("customType", value)}
            />
          )}
          {step === 2 && (
            <Step2
              brand={form.brand}
              model={form.model}
              year={form.year}
              manualEntry={form.manualEntry}
              onChange={(key, value) => update(key as keyof FormState, value as never)}
              setManual={(value) => update("manualEntry", value)}
            />
          )}
          {step === 3 && (
            <Step3
              brand={form.brand}
              model={form.model}
              connector={form.connector}
              hasAdapter={form.hasAdapter}
              adapters={form.adapters}
              recommended={recommendedConnector}
              onConnector={(value) => update("connector", value)}
              onAdapterToggle={(value) => update("hasAdapter", value)}
              onAdapters={(value) => update("adapters", value)}
            />
          )}
          {step === 4 && (
            <Step4
              name={form.name}
              plate={form.plate}
              color={form.color}
              range={form.range}
              photo={form.photo}
              onChange={(key, value) => update(key as keyof FormState, value as never)}
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
              {step === 4 ? "Guardar vehiculo" : "Continuar"}
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

function StepHeading({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div className="mb-6 animate-slide-up">
      <h1 className="text-balance text-2xl font-semibold leading-tight">{title}</h1>
      {subtitle && <p className="mt-2 text-sm text-foreground-muted">{subtitle}</p>}
    </div>
  )
}

function HelperCard({
  title,
  text,
}: {
  title: string
  text: string
}) {
  return (
    <GlassCard className="mb-5 rounded-[24px] border border-border/70 bg-card/70 p-4">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-foreground-muted">{text}</p>
    </GlassCard>
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
      <StepHeading
        title="Que vehiculo quieres registrar?"
        subtitle="Primero identifiquemos el tipo de vehiculo para mostrarte cargadores y rutas acordes."
      />
      <div className="grid grid-cols-2 gap-3">
        {types.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-pressed={type === id}
            className={cn(
              "flex min-h-[120px] flex-col items-start justify-between rounded-3xl border p-4 text-left transition-all",
              type === id
                ? "border-primary/60 bg-primary/10 ring-2 ring-primary/30"
                : "border-border bg-card hover:bg-overlay-hover",
            )}
          >
            <Icon className={cn("h-7 w-7", type === id ? "text-primary" : "text-foreground-muted")} />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>
      {type === "otro" && (
        <div className="mt-5 animate-slide-up">
          <Label htmlFor="customType" className="text-foreground-muted">
            Describe tu tipo de vehiculo
          </Label>
          <Input
            id="customType"
            value={customType}
            onChange={(event) => onCustom(event.target.value)}
            placeholder="Ej: Microbus electrico"
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
  const yearOptions = React.useMemo(() => Array.from({ length: 12 }, (_, i) => String(2026 - i)), [])
  const brandData = vehicleCatalog.find((item) => item.brand === brand)

  return (
    <>
      <StepHeading
        title="Completa tu vehiculo sin perderte"
        subtitle="Organizamos esta parte en dos caminos: guiado con catalogo o ingreso manual."
      />
      <div className="mb-5 grid grid-cols-2 gap-3">
        <ModeCard
          active={!manualEntry}
          title="Catalogo guiado"
          text="Elige marca, modelo y ano con ayuda visual."
          onClick={() => setManual(false)}
        />
        <ModeCard
          active={manualEntry}
          title="Ingreso manual"
          text="Para vehiculos poco comunes o no listados."
          onClick={() => setManual(true)}
        />
      </div>

      {!manualEntry ? (
        <>
          <HelperCard
            title="Paso guiado"
            text="Selecciona marca, luego modelo y por ultimo el ano. Solo te mostramos lo que sigue para que no se vuelva una lista dificil de leer."
          />

          <div className="space-y-5">
            <div>
              <Label className="text-foreground-muted">1. Marca</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {vehicleCatalog.map((item) => (
                  <button
                    key={item.brand}
                    type="button"
                    onClick={() => {
                      onChange("brand", item.brand)
                      onChange("model", "")
                      onChange("year", "")
                    }}
                    className={ChoiceClass(brand === item.brand)}
                  >
                    {item.brand}
                  </button>
                ))}
              </div>
            </div>

            {brandData && (
              <div className="animate-slide-up">
                <Label className="text-foreground-muted">2. Modelo</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {brandData.models.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        onChange("model", item)
                        onChange("year", "")
                      }}
                      className={ChoiceClass(model === item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {model && (
              <div className="animate-slide-up">
                <Label className="text-foreground-muted">3. Ano</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {yearOptions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => onChange("year", item)}
                      className={ChoiceClass(year === item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <SelectionResume brand={brand} model={model} year={year} />
          </div>
        </>
      ) : (
        <>
          <HelperCard
            title="Ingreso manual"
            text="Usa este modo si tu vehiculo no aparece o si prefieres escribir los datos directamente."
          />
          <div className="space-y-4">
            <FieldBlock label="Marca" htmlFor="brand">
              <Input
                id="brand"
                value={brand}
                onChange={(event) => onChange("brand", event.target.value)}
                className="mt-2 h-14"
                placeholder="Ej: BYD"
              />
            </FieldBlock>
            <FieldBlock label="Modelo" htmlFor="model">
              <Input
                id="model"
                value={model}
                onChange={(event) => onChange("model", event.target.value)}
                className="mt-2 h-14"
                placeholder="Ej: Seagull"
              />
            </FieldBlock>
            <FieldBlock label="Ano" htmlFor="year">
              <Input
                id="year"
                type="number"
                value={year}
                onChange={(event) => onChange("year", event.target.value)}
                className="mt-2 h-14"
                placeholder="2025"
              />
            </FieldBlock>
          </div>
        </>
      )}
    </>
  )
}

function Step3({
  brand,
  model,
  connector,
  hasAdapter,
  adapters,
  recommended,
  onConnector,
  onAdapterToggle,
  onAdapters,
}: {
  brand: string
  model: string
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
      <StepHeading
        title="Como se llena tu vehiculo?"
        subtitle="Hicimos esta parte mas directa: primero el conector principal y despues los adaptadores, si aplica."
      />
      <HelperCard
        title="Tu vehiculo actual"
        text={
          brand || model
            ? `${brand} ${model}`.trim() + (recommended ? ` suele usar ${recommended}.` : ".")
            : "Si aun no conoces el conector, elige la opcion de ayuda y luego te seguiremos guiando."
        }
      />

      <div className="space-y-2">
        {connectors.map((item) => {
          const selected = connector === item.id
          const isRecommended = recommended === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onConnector(item.id)}
              aria-pressed={selected}
              className={cn(
                "flex w-full items-start gap-3 rounded-3xl border p-4 text-left transition",
                selected ? "border-primary/60 bg-primary/10" : "border-border bg-card hover:bg-overlay-hover",
              )}
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
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{item.label}</span>
                  {isRecommended && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-medium text-warning">
                      <Star className="h-3 w-3" />
                      Recomendado
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-foreground-muted">{item.desc}</p>
              </div>
            </button>
          )
        })}
      </div>

      {connector === "no-seguro" && (
        <GlassCard className="mt-4 animate-slide-up">
          <p className="text-sm text-foreground">
            No pasa nada. Podras seguir usando la app y luego afinamos compatibilidades.
          </p>
        </GlassCard>
      )}

      <div className="mt-6 space-y-3">
        <Label className="text-foreground-muted">Usas adaptador?</Label>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => onAdapterToggle(false)} className={ChoiceClass(hasAdapter === false)}>
            No
          </button>
          <button type="button" onClick={() => onAdapterToggle(true)} className={ChoiceClass(hasAdapter === true)}>
            Si
          </button>
        </div>

        {hasAdapter && (
          <div className="space-y-2 animate-slide-up">
            {adapterOptions.map((item) => {
              const checked = adapters.includes(item)
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => onAdapters(checked ? adapters.filter((value) => value !== item) : [...adapters, item])}
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
                  <span className="text-sm">{item}</span>
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
      <StepHeading
        title="Dale identidad a tu vehiculo"
        subtitle="Solo pedimos lo necesario para personalizar recomendaciones y que reconozcas tu carro rapido."
      />
      <div className="space-y-4">
        <FieldBlock label="Nombre del vehiculo" htmlFor="vname">
          <Input
            id="vname"
            value={name}
            onChange={(event) => onChange("name", event.target.value)}
            placeholder="Mi BYD Seagull"
            className="mt-2 h-14"
          />
        </FieldBlock>
        <FieldBlock label="Placa" htmlFor="plate">
          <Input
            id="plate"
            value={plate}
            onChange={(event) => onChange("plate", event.target.value.toUpperCase())}
            placeholder="ABC123"
            className="mt-2 h-14 uppercase tracking-widest"
          />
        </FieldBlock>
        <FieldBlock label="Color" htmlFor="color">
          <Input
            id="color"
            value={color}
            onChange={(event) => onChange("color", event.target.value)}
            placeholder="Plata, negro, blanco"
            className="mt-2 h-14"
          />
        </FieldBlock>
        <FieldBlock label="Autonomia maxima al 100%" htmlFor="range">
          <div className="mt-2 flex items-center gap-2">
            <Input
              id="range"
              type="number"
              value={range}
              onChange={(event) => onChange("range", event.target.value)}
              placeholder="380"
              className="h-14 flex-1 rounded-2xl border-border bg-card text-base"
            />
            <span className="text-sm text-foreground-muted">km</span>
          </div>
          <p className="mt-1.5 text-xs text-foreground-soft">
            Usamos este dato del fabricante para estimar rutas sin sorpresas.
          </p>
        </FieldBlock>

        <button
          type="button"
          onClick={() => setCameraOpen(true)}
          className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-border bg-card/50 p-4 text-left text-sm text-foreground-muted hover:bg-overlay-hover"
        >
          <Camera className="h-5 w-5" />
          {photo ? "Cambiar foto del vehiculo" : "Tomar foto de mi vehiculo"}
        </button>
      </div>

      {cameraOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
        >
          <div className="glass-strong w-full max-w-sm rounded-3xl p-6">
            <div className="map-pattern mb-4 flex aspect-square items-center justify-center rounded-2xl border border-border">
              <Camera className="h-12 w-12 text-foreground-muted" />
            </div>
            <p className="mb-4 text-center text-sm text-foreground-muted">
              Toma una foto referencial. No se sube a ningun servidor.
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
      <StepHeading
        title="Tu vehiculo esta listo"
        subtitle="Revisa todo antes de ir al inicio. Si algo no se ve bien, puedes volver y corregirlo."
      />
      <GlassCard variant="strong" className="overflow-hidden p-0">
        <div className="map-pattern relative aspect-[16/9] w-full">
          <img
            src={form.photo || "/vehicle-byd-seagull-side-dark.jpg"}
            alt={form.name || "Vehiculo"}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
        <div className="space-y-3 p-5">
          <Row label="Nombre" value={form.name || "Sin nombre"} />
          <Row label="Placa" value={form.plate || "-"} mono />
          <Row label="Marca y modelo" value={`${form.brand} ${form.model} ${form.year}`.trim() || "-"} />
          <Row label="Conector principal" value={form.connector || "-"} />
          <Row
            label="Adaptadores"
            value={form.hasAdapter && form.adapters.length ? form.adapters.join(", ") : "Ninguno"}
          />
          <Row label="Autonomia maxima" value={`${form.range || 0} km`} />
        </div>
      </GlassCard>
      <GlassCard className="mt-4 flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-success/15 text-success">
          <Check className="h-4 w-4" />
        </div>
        <div className="text-sm">
          <p className="font-medium">Ganaste 50 CumbrevaCoins</p>
          <p className="text-xs text-foreground-muted">Por completar el registro de tu vehiculo.</p>
        </div>
      </GlassCard>
    </>
  )
}

function ModeCard({
  active,
  title,
  text,
  onClick,
}: {
  active: boolean
  title: string
  text: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-[24px] border p-4 text-left transition",
        active ? "border-primary/60 bg-primary/10 ring-2 ring-primary/20" : "border-border bg-card hover:bg-overlay-hover",
      )}
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-foreground-muted">{text}</p>
    </button>
  )
}

function SelectionResume({
  brand,
  model,
  year,
}: {
  brand: string
  model: string
  year: string
}) {
  return (
    <GlassCard className="rounded-[24px] border border-border/70 bg-card/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground-soft">
        Resumen en vivo
      </p>
      <p className="mt-2 text-sm font-medium">
        {[brand, model, year].filter(Boolean).join(" - ") || "Aun no has completado la seleccion"}
      </p>
      <p className="mt-1 text-xs text-foreground-muted">
        Ver este resumen evita perderse entre muchas opciones.
      </p>
    </GlassCard>
  )
}

function FieldBlock({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div>
      <Label htmlFor={htmlFor} className="text-foreground-muted">
        {label}
      </Label>
      {children}
    </div>
  )
}

function ChoiceClass(active: boolean) {
  return cn(
    "rounded-2xl border px-4 py-3 text-sm transition",
    active
      ? "border-primary/60 bg-primary/10 text-primary"
      : "border-border bg-card text-foreground hover:bg-overlay-hover",
  )
}

function Row({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-2 last:border-0 last:pb-0">
      <span className="text-xs uppercase tracking-wider text-foreground-soft">{label}</span>
      <span className={cn("text-right text-sm font-medium", mono && "font-mono")}>{value}</span>
    </div>
  )
}
