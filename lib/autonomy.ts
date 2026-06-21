import type { Vehicle, Preferences } from "@/lib/plugo-context"

/**
 * PLUGO — Modelo de autonomía real según la geografía.
 *
 * El valor diferenciador de PLUGO: no estimar la autonomía de forma lineal
 * (distancia / rango), sino ponderar las condiciones reales que más impactan
 * el consumo de un vehículo eléctrico:
 *   1. Relieve  — subir consume mucho; bajar recupera energía (regeneración).
 *   2. Clima    — el frío y el calor extremo reducen la autonomía.
 *   3. Velocidad— la resistencia aerodinámica crece con la velocidad.
 *   4. Estilo   — eco / normal / deportivo.
 *   5. Climatización (HVAC) — A/C o calefacción encendida.
 *
 * Es un modelo simulado pero físicamente plausible y configurable. Trabaja en
 * porcentaje de batería para encajar con el resto de la app.
 */

export type DrivingStyle = "eco" | "normal" | "sport"

export type Conditions = {
  /** Temperatura ambiente (°C). */
  tempC: number
  /** Velocidad promedio del trayecto (km/h). */
  speedKmh: number
  /** Estilo de conducción. */
  style: DrivingStyle
  /** Climatización (A/C o calefacción) encendida. */
  hvac: boolean
}

/** Cambio de elevación de un trayecto, en metros. */
export type Terrain = {
  /** Cambio neto de altitud (positivo = sube, negativo = baja). */
  netM: number
}

const OPTIMAL_TEMP = 20

/** Consumo nominal en %/km a 100% de batería, derivado del rango del vehículo. */
export function nominalPctPerKm(v: Vehicle | null): number {
  const range = v?.range && v.range > 0 ? v.range : 300
  return 100 / range
}

/** Factor por temperatura (multiplicador del consumo). 1.0 = óptimo. */
export function tempFactor(tempC: number): number {
  const cold = Math.max(0, 15 - tempC) * 0.012 // frío: hasta +x%
  const hot = Math.max(0, tempC - 26) * 0.009 // calor: A/C y batería
  return clamp(1 + cold + hot, 0.95, 1.5)
}

/** Factor por velocidad (resistencia aerodinámica). Base 60 km/h. */
export function speedFactor(speedKmh: number): number {
  return clamp(1 + (speedKmh - 60) * 0.004, 0.85, 1.45)
}

/** Factor por estilo de conducción. */
export function styleFactor(style: DrivingStyle): number {
  return style === "eco" ? 0.9 : style === "sport" ? 1.18 : 1
}

/** Factor por climatización encendida. */
export function hvacFactor(hvac: boolean): number {
  return hvac ? 1.07 : 1
}

/** Factor de eficiencia combinado (excluye relieve, que es aditivo por trayecto). */
export function efficiencyFactor(c: Conditions): number {
  return tempFactor(c.tempC) * speedFactor(c.speedKmh) * styleFactor(c.style) * hvacFactor(c.hvac)
}

/**
 * Consumo adicional (en % de batería) por el relieve de un trayecto.
 * Subir: ~8% por cada 1000 m. Bajar: recupera ~50% vía regeneración.
 */
export function elevationPct(netM: number): number {
  if (netM >= 0) return netM * 0.008
  return netM * 0.004 // negativo → reduce el consumo (regeneración parcial)
}

export type RangeBreakdown = {
  /** Autonomía real estimada (km) con la batería y condiciones dadas. */
  km: number
  /** Autonomía "ideal" sin penalizaciones (km), para comparar. */
  idealKm: number
  /** Factor de eficiencia aplicado. */
  factor: number
}

/** Autonomía real disponible AHORA, dada la batería y las condiciones. */
export function realRange(v: Vehicle | null, batteryPct: number, c: Conditions): RangeBreakdown {
  const range = v?.range && v.range > 0 ? v.range : 300
  const b = clamp(batteryPct, 0, 100) / 100
  const factor = efficiencyFactor(c)
  const idealKm = Math.round(range * b)
  const km = Math.round(idealKm / factor)
  return { km, idealKm, factor }
}

export type TripEstimate = {
  /** % de batería consumido por el trayecto. */
  usedPct: number
  /** % de batería estimado al llegar (null si no hay batería registrada). */
  arrivalPct: number | null
  /** ¿Llega con un margen de confianza (>= 15%)? */
  canArrive: boolean
  /** Desglose de impacto por factor (en puntos porcentuales de batería). */
  factors: {
    base: number
    relieve: number
    clima: number
    velocidad: number
    estilo: number
    climatizacion: number
  }
}

/**
 * Estima el consumo de un trayecto considerando la geografía.
 * El desglose reparte el consumo total entre la base y cada factor para
 * poder mostrar "por qué" cambia la autonomía.
 */
export function estimateTrip(
  v: Vehicle | null,
  batteryPct: number | null,
  trip: { distanceKm: number; terrain: Terrain; conditions: Conditions },
): TripEstimate {
  const perKm = nominalPctPerKm(v)
  const base = perKm * trip.distanceKm

  // Contribución de cada factor multiplicativo sobre la base (puntos %).
  const fTemp = tempFactor(trip.conditions.tempC)
  const fSpeed = speedFactor(trip.conditions.speedKmh)
  const fStyle = styleFactor(trip.conditions.style)
  const fHvac = hvacFactor(trip.conditions.hvac)

  const clima = base * (fTemp - 1)
  const velocidad = base * (fSpeed - 1)
  const estilo = base * (fStyle - 1)
  const climatizacion = base * (fHvac - 1)
  const relieve = elevationPct(trip.terrain.netM)

  const usedRaw = base + clima + velocidad + estilo + climatizacion + relieve
  const usedPct = clamp(Math.round(usedRaw), 0, 100)

  const arrivalPct = batteryPct === null ? null : clamp(Math.round(batteryPct - usedRaw), 0, 100)
  const canArrive = arrivalPct === null ? usedPct <= 70 : arrivalPct >= 15

  return {
    usedPct,
    arrivalPct,
    canArrive,
    factors: {
      base: Math.round(base),
      relieve: Math.round(relieve),
      clima: Math.round(clima),
      velocidad: Math.round(velocidad),
      estilo: Math.round(estilo),
      climatizacion: Math.round(climatizacion),
    },
  }
}

/** Mapea la preferencia de carga del usuario a un estilo de conducción. */
export function styleFromPreferences(prefs?: Preferences): DrivingStyle {
  switch (prefs?.chargingPriority) {
    case "ahorrar":
      return "eco"
    case "rapido":
      return "sport"
    default:
      return "normal"
  }
}

/**
 * Condiciones "actuales" por defecto (mock de clima/ciudad).
 * Bogotá y la sabana son frías (~14°C), lo que ya reduce la autonomía real.
 */
export function currentConditions(prefs?: Preferences): Conditions {
  return {
    tempC: 14,
    speedKmh: 45, // urbano
    style: styleFromPreferences(prefs),
    hvac: false,
  }
}

/** Condiciones de viaje (más velocidad de carretera). */
export function tripConditions(prefs?: Preferences, opts?: Partial<Conditions>): Conditions {
  return {
    tempC: 18,
    speedKmh: 80, // carretera
    style: styleFromPreferences(prefs),
    hvac: true,
    ...opts,
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}
