// Capa única de geolocalización: usa el plugin nativo (@capacitor/geolocation)
// cuando la app corre dentro de Capacitor (Android), y cae a la Web Geolocation
// API (navigator.geolocation) en el navegador. La interfaz es la misma en ambos
// casos: pasás onUpdate/onError y te devuelve una función para cortar el watch.

import { Capacitor } from "@capacitor/core"

export type GeoPoint = { lat: number; lon: number }

export type WatchHandlers = {
  onUpdate: (point: GeoPoint) => void
  onError?: (message: string) => void
}

const GEO_OPTIONS = { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }

/** ¿Estamos corriendo dentro del contenedor nativo de Capacitor? */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform()
}

/**
 * Empieza a seguir la posición. Devuelve una función para detener el seguimiento
 * (siempre segura de llamar). Si no hay soporte de GPS, llama onError y no hace nada.
 */
export function watchPosition({ onUpdate, onError }: WatchHandlers): () => void {
  // --- Plataforma nativa (Android/iOS): plugin de Capacitor ---
  if (isNativePlatform()) {
    let watchId: string | null = null
    let cancelled = false

    ;(async () => {
      try {
        const { Geolocation } = await import("@capacitor/geolocation")
        // Pide permiso explícito antes de arrancar el watch en nativo.
        const perm = await Geolocation.requestPermissions()
        if (perm.location === "denied" && perm.coarseLocation === "denied") {
          onError?.("Permiso de ubicación denegado")
          return
        }
        if (cancelled) return
        watchId = await Geolocation.watchPosition(GEO_OPTIONS, (pos, err) => {
          if (err) {
            onError?.(err.message ?? "Error de GPS")
            return
          }
          if (pos) onUpdate({ lat: pos.coords.latitude, lon: pos.coords.longitude })
        })
      } catch (e) {
        onError?.(e instanceof Error ? e.message : "No se pudo iniciar el GPS")
      }
    })()

    return () => {
      cancelled = true
      if (watchId !== null) {
        import("@capacitor/geolocation")
          .then(({ Geolocation }) => Geolocation.clearWatch({ id: watchId! }))
          .catch(() => {})
        watchId = null
      }
    }
  }

  // --- Web: navigator.geolocation ---
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    onError?.("Este dispositivo no soporta geolocalización")
    return () => {}
  }

  const id = navigator.geolocation.watchPosition(
    (p) => onUpdate({ lat: p.coords.latitude, lon: p.coords.longitude }),
    (err) => onError?.(err.message),
    GEO_OPTIONS,
  )
  return () => navigator.geolocation.clearWatch(id)
}
