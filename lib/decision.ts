import type { Charger, ConnectorType } from "@/lib/mock-data"
import type { Vehicle } from "@/lib/cumbreva-context"

/** Estimación de probabilidad de disponibilidad (0-100). Determinista por id. */
export function chargerProbability(c: Charger): number {
  if (c.status === "fuera-de-servicio") return 0
  // Hash determinista a partir del id para tener variedad estable entre renders
  let hash = 0
  for (let i = 0; i < c.id.length; i++) hash = (hash * 31 + c.id.charCodeAt(i)) >>> 0
  const noise = hash % 18 // 0..17
  if (c.status === "ocupado") {
    // Cuanto mayor sea el wait, menor la probabilidad de que se libere pronto
    const base = Math.max(0, 70 - c.estimatedWaitMin * 2)
    return Math.max(20, Math.min(78, base + (noise - 9)))
  }
  // Disponible: alta probabilidad
  const base = 86 + noise / 3 // 86..91
  return Math.round(Math.min(96, base))
}

export type ProbabilityLevel = "alta" | "media" | "baja"

export function probabilityLevel(p: number): ProbabilityLevel {
  if (p >= 80) return "alta"
  if (p >= 50) return "media"
  return "baja"
}

export const probabilityClasses: Record<ProbabilityLevel, { dot: string; text: string; bg: string; ring: string }> = {
  alta: {
    dot: "bg-success",
    text: "text-success",
    bg: "bg-success/15",
    ring: "ring-success/30",
  },
  media: {
    dot: "bg-warning",
    text: "text-warning",
    bg: "bg-warning/15",
    ring: "ring-warning/30",
  },
  baja: {
    dot: "bg-destructive",
    text: "text-destructive",
    bg: "bg-destructive/15",
    ring: "ring-destructive/30",
  },
}

export function probabilityLabel(p: number): string {
  const lvl = probabilityLevel(p)
  if (lvl === "alta") return "Alta disponibilidad"
  if (lvl === "media") return "Disponibilidad media"
  return "Poco probable"
}

/** Tiempo estimado en minutos a partir de distancia (km). */
export function estimatedMinutes(distanceKm: number): number {
  // Velocidad promedio urbana 30 km/h, regional 60 km/h
  const speed = distanceKm < 20 ? 30 : 60
  return Math.max(1, Math.round((distanceKm / speed) * 60))
}

/** Consumo aproximado de batería (%) recorriendo distance km, dado un vehículo. */
export function batteryUsedFor(distanceKm: number, v: Vehicle | null): number {
  const range = v?.range && v.range > 0 ? v.range : 300
  return Math.round((distanceKm / range) * 100)
}

/** Batería estimada al llegar a un punto a `distanceKm` partiendo de `current` %. */
export function batteryAtArrival(distanceKm: number, current: number, v: Vehicle | null): number {
  const used = batteryUsedFor(distanceKm, v)
  return Math.max(0, Math.min(100, current - used))
}

/** Compatibilidad cargador <-> vehículo. */
export function compatibility(c: Charger, v: Vehicle | null): {
  compatible: boolean
  viaAdapter: boolean
  reason?: string
} {
  if (!v) return { compatible: true, viaAdapter: false }
  const native = v.connector as ConnectorType | string
  if (c.connectors.includes(native as ConnectorType)) {
    return { compatible: true, viaAdapter: false }
  }
  const adapters = (v.adapters || []) as string[]
  const matchAdapter = c.connectors.find((cc) => adapters.includes(cc))
  if (matchAdapter) {
    return { compatible: true, viaAdapter: true, reason: `Compatible con tu adaptador ${matchAdapter}` }
  }
  return {
    compatible: false,
    viaAdapter: false,
    reason: "Este cargador no es compatible con tu vehículo.",
  }
}

/** Score para recomendar un cargador. Mayor es mejor. */
export function chargerScore(c: Charger, v: Vehicle | null): number {
  if (c.status === "fuera-de-servicio") return -1
  const compat = compatibility(c, v)
  if (!compat.compatible) return -1
  const prob = chargerProbability(c)
  const distancePenalty = Math.min(40, c.distanceKm * 4) // dentro de ciudad
  const ratingBoost = (c.rating - 4) * 8
  const adapterPenalty = compat.viaAdapter ? 6 : 0
  return prob - distancePenalty + ratingBoost - adapterPenalty
}

/** Devuelve la mejor opción y una alternativa cercana. */
export function rankChargers(
  list: Charger[],
  v: Vehicle | null,
): { primary: Charger | null; fallback: Charger | null; rest: Charger[] } {
  const scored = list
    .map((c) => ({ c, score: chargerScore(c, v) }))
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score)
  const primary = scored[0]?.c ?? null
  const fallback = scored[1]?.c ?? null
  const rest = scored.slice(2).map((x) => x.c)
  return { primary, fallback, rest }
}

/** Estado de batería para mensajes. Acepta null cuando el usuario no la registró. */
export function batteryState(b: number | null): {
  level: "verde" | "amarillo" | "rojo" | "urgente" | "sin-dato"
  message: string
  hint: string
} {
  if (b === null) {
    return {
      level: "sin-dato",
      message: "Puedes moverte con tranquilidad",
      hint: "Agrega tu nivel de batería para recomendaciones más precisas.",
    }
  }
  if (b <= 15) {
    return {
      level: "urgente",
      message: "Carga inmediata recomendada",
      hint: "Tu batería está muy baja. Te llevamos al cargador más confiable cerca.",
    }
  }
  if (b <= 30) {
    return {
      level: "rojo",
      message: "Te recomendamos planear una carga",
      hint: "Tu autonomía es limitada. Busquemos un cargador en tu camino.",
    }
  }
  if (b <= 55) {
    return {
      level: "amarillo",
      message: "Podrías necesitar cargar pronto",
      hint: "Está bien para trayectos cortos. Considera cargar antes de salir lejos.",
    }
  }
  return {
    level: "verde",
    message: "Puedes moverte con tranquilidad",
    hint: "Tienes carga suficiente para tu día.",
  }
}

/** Construye URL de Google Maps para navegación turn-by-turn. */
export function googleMapsRouteUrl(destination: string, origin = "Mi+ubicación") {
  const o = encodeURIComponent(origin)
  const d = encodeURIComponent(destination)
  return `https://www.google.com/maps/dir/?api=1&origin=${o}&destination=${d}&travelmode=driving`
}

export function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h} h` : `${h} h ${m} min`
}
