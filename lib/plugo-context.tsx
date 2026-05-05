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
  plugoCoins: number
  streakDays: number
  isHost: boolean
  favoriteServices: string[]
}

type Action =
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
  plugoCoins: 0,
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
  plugoCoins: 1250,
  streakDays: 3,
  isHost: false,
  favoriteServices: [],
}

const initialState: State = loggedOutState

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOGIN":
      return { ...loggedInState, hasSession: true, userName: action.name }
    case "LOGOUT":
      return { ...loggedOutState }
    case "SET_VEHICLE":
      return { ...state, vehicle: action.vehicle }
    case "ADD_VEHICLE": {
      const vehicles = [...state.vehicles, action.vehicle]
      return { ...state, vehicles, vehicle: state.vehicle ?? action.vehicle }
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
      return { ...state, plugoCoins: state.plugoCoins + action.amount }
    default:
      return state
  }
}

const PlugoContext = React.createContext<{
  state: State
  dispatch: React.Dispatch<Action>
} | null>(null)

const STORAGE_KEY = "plugo:state:v2"

export function PlugoProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, initialState, (init) => {
    if (typeof window === "undefined") return init
    try {
      // Clear old storage keys
      window.localStorage.removeItem("plugo:state:v1")
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return init
      const parsed = JSON.parse(raw) as State
      return { ...init, ...parsed }
    } catch {
      return init
    }
  })

  React.useEffect(() => {
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {}
  }, [state])

  return <PlugoContext.Provider value={{ state, dispatch }}>{children}</PlugoContext.Provider>
}

export function usePlugo() {
  const ctx = React.useContext(PlugoContext)
  if (!ctx) throw new Error("usePlugo debe usarse dentro de PlugoProvider")
  return ctx
}

export function useBatteryStatus(): {
  level: "verde" | "amarillo" | "rojo" | "sin-dato"
  message: string
} {
  const { state } = usePlugo()
  const b = state.battery
  if (b === null) {
    return { level: "sin-dato", message: "Puedes moverte con tranquilidad" }
  }
  if (b >= 50) return { level: "verde", message: "Puedes moverte con tranquilidad" }
  if (b >= 25) return { level: "amarillo", message: "Podrías necesitar cargar pronto" }
  return { level: "rojo", message: "Te recomendamos planear una carga" }
}
