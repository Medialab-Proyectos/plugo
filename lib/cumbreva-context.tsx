"use client"

import * as React from "react"

export type Vehicle = {
  id: string
  type: string
  customType?: string
  brand: string
  model: string
  year: string
  connector: string
  adapters: string[]
  name: string
  plate: string
  color: string
  range: number // km máx 100%
  photo?: string | null
}

export type Preferences = {
  chargingPriority: "ahorrar" | "rapido" | "balanceado"
  mapPriority: "cercano" | "barato" | "confiable" | "calificado"
  notifications: {
    chargers: boolean
    trips: boolean
    documents: boolean
    prices: boolean
  }
}

type Battery = number | null

type State = {
  hasSession: boolean
  userName: string
  vehicle: Vehicle | null
  vehicles: Vehicle[]
  activeVehicleIndex: number
  battery: Battery
  preferences: Preferences
  cumbrevaCoins: number
  streakDays: number
  isHost: boolean
  favoriteServices: string[]
}

type Action =
  | { type: "HYDRATE"; state: Partial<State> }
  | { type: "LOGIN"; name: string }
  | { type: "LOGOUT" }
  | { type: "SET_VEHICLE"; vehicle: Vehicle }
  | { type: "ADD_VEHICLE"; vehicle: Vehicle }
  | { type: "SET_ACTIVE_VEHICLE"; index: number }
  | { type: "SET_BATTERY"; battery: number }
  | { type: "SET_PREFERENCES"; prefs: Partial<Preferences> }
  | { type: "TOGGLE_FAVORITE"; serviceId: string }
  | { type: "SET_HOST"; isHost: boolean }
  | { type: "ADD_COINS"; amount: number }

const defaultPreferences: Preferences = {
  chargingPriority: "balanceado",
  mapPriority: "cercano",
  notifications: {
    chargers: true,
    trips: true,
    documents: true,
    prices: false,
  },
}

const defaultVehicles: Vehicle[] = [
  {
    id: "byd-yuan-plus-1",
    type: "SUV",
    brand: "BYD",
    model: "Yuan Plus",
    year: "2025",
    connector: "CCS2",
    adapters: ["Tipo 2"],
    name: "BYD Yuan Plus",
    plate: "ABC 123",
    color: "Blanco",
    range: 410,
    photo: "/Dominio/SofIma/home-car.png",
  },
  {
    id: "tesla-model-3-1",
    type: "Sedán",
    brand: "Tesla",
    model: "Model 3",
    year: "2024",
    connector: "CCS2",
    adapters: ["Tipo 2"],
    name: "Tesla Model 3",
    plate: "XYZ 789",
    color: "Negro",
    range: 510,
    photo: null,
  },
]

const loggedOutState: State = {
  hasSession: false,
  userName: "",
  vehicle: null,
  vehicles: [],
  activeVehicleIndex: 0,
  battery: 0,
  preferences: defaultPreferences,
  cumbrevaCoins: 0,
  streakDays: 0,
  isHost: false,
  favoriteServices: [],
}

const loggedInState: State = {
  hasSession: true,
  userName: "Camilo",
  vehicle: defaultVehicles[0],
  vehicles: defaultVehicles,
  activeVehicleIndex: 0,
  battery: 42,
  preferences: defaultPreferences,
  cumbrevaCoins: 1250,
  streakDays: 3,
  isHost: false,
  favoriteServices: [],
}

const initialState: State = loggedOutState

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, ...action.state }
    case "LOGIN":
      return { ...loggedInState, hasSession: true, userName: action.name }
    case "LOGOUT":
      return { ...loggedOutState }
    case "SET_VEHICLE":
      return { ...state, vehicle: action.vehicle }
    case "ADD_VEHICLE": {
      const vehicles = [...state.vehicles, action.vehicle]
      // El vehículo recién creado queda como el activo y visible en el carrusel.
      return { ...state, vehicles, vehicle: action.vehicle, activeVehicleIndex: vehicles.length - 1 }
    }
    case "SET_ACTIVE_VEHICLE": {
      const idx = action.index
      const v = state.vehicles[idx]
      if (!v) return state
      return { ...state, activeVehicleIndex: idx, vehicle: v }
    }
    case "SET_BATTERY":
      return { ...state, battery: action.battery }
    case "SET_PREFERENCES":
      return { ...state, preferences: { ...state.preferences, ...action.prefs } }
    case "TOGGLE_FAVORITE": {
      const exists = state.favoriteServices.includes(action.serviceId)
      return {
        ...state,
        favoriteServices: exists
          ? state.favoriteServices.filter((s) => s !== action.serviceId)
          : [...state.favoriteServices, action.serviceId],
      }
    }
    case "SET_HOST":
      return { ...state, isHost: action.isHost }
    case "ADD_COINS":
      return { ...state, cumbrevaCoins: state.cumbrevaCoins + action.amount }
    default:
      return state
  }
}

const CumbrevaContext = React.createContext<{
  state: State
  dispatch: React.Dispatch<Action>
} | null>(null)

const STORAGE_KEY = "cumbreva:state:v2"

export function CumbrevaProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const [hydrated, setHydrated] = React.useState(false)

  // El estado persistido se carga SOLO en el cliente, después de montar. Así el primer
  // render coincide con el HTML del servidor (ambos usan initialState) y no se produce
  // el "hydration mismatch". Leer localStorage durante el render lo rompía.
  React.useEffect(() => {
    try {
      window.localStorage.removeItem("cumbreva:state:v1") // limpia clave vieja
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) dispatch({ type: "HYDRATE", state: JSON.parse(raw) as Partial<State> })
    } catch {}
    setHydrated(true)
  }, [])

  // Persiste solo una vez hidratado, para no pisar lo guardado con los valores por defecto.
  React.useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {}
  }, [state, hydrated])

  // Hasta hidratar no renderizamos el contenido: evita un parpadeo del estado por
  // defecto (p. ej. la pantalla vacía) antes de cargar lo guardado.
  return (
    <CumbrevaContext.Provider value={{ state, dispatch }}>
      {hydrated ? children : null}
    </CumbrevaContext.Provider>
  )
}

export function useCumbreva() {
  const ctx = React.useContext(CumbrevaContext)
  if (!ctx) throw new Error("useCumbreva debe usarse dentro de CumbrevaProvider")
  return ctx
}

export function useBatteryStatus(): {
  level: "verde" | "amarillo" | "rojo" | "sin-dato"
  message: string
} {
  const { state } = useCumbreva()
  const b = state.battery
  if (b === null) {
    return { level: "sin-dato", message: "Puedes moverte con tranquilidad" }
  }
  if (b >= 50) return { level: "verde", message: "Puedes moverte con tranquilidad" }
  if (b >= 25) return { level: "amarillo", message: "Podrías necesitar cargar pronto" }
  return { level: "rojo", message: "Te recomendamos planear una carga" }
}
