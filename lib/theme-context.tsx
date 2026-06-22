"use client"

import * as React from "react"

type Theme = "dark" | "light"

const ThemeContext = React.createContext<{
  theme: Theme
  /** true cuando el tema sigue la preferencia del sistema (sin elección explícita) */
  isSystem: boolean
  toggle: () => void
  setTheme: (theme: Theme) => void
  /** vuelve a seguir la preferencia del sistema */
  useSystem: () => void
}>({
  theme: "light",
  isSystem: true,
  toggle: () => {},
  setTheme: () => {},
  useSystem: () => {},
})

const STORAGE_KEY = "cumbreva:theme"

function systemTheme(): Theme {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"
}

function apply(theme: Theme) {
  document.documentElement.classList.toggle("light", theme === "light")
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute("content", theme === "light" ? "#f5f7f9" : "#070b10")
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // El script anti-flash (app/layout.tsx) ya aplicó la clase antes del paint.
  const [theme, setThemeState] = React.useState<Theme>("light")
  const [isSystem, setIsSystem] = React.useState(true)

  // Sincroniza el estado de React con lo que el script anti-flash dejó en el DOM.
  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (stored === "light" || stored === "dark") {
      setThemeState(stored)
      setIsSystem(false)
      apply(stored)
    } else {
      const sys = systemTheme()
      setThemeState(sys)
      setIsSystem(true)
      apply(sys)
    }
  }, [])

  // Sigue los cambios del sistema mientras no haya elección explícita.
  React.useEffect(() => {
    if (!isSystem) return
    const mq = window.matchMedia("(prefers-color-scheme: light)")
    const onChange = () => {
      const sys = systemTheme()
      setThemeState(sys)
      apply(sys)
    }
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [isSystem])

  const setTheme = React.useCallback((next: Theme) => {
    localStorage.setItem(STORAGE_KEY, next)
    setIsSystem(false)
    setThemeState(next)
    apply(next)
  }, [])

  const toggle = React.useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark")
  }, [theme, setTheme])

  const useSystem = React.useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    const sys = systemTheme()
    setIsSystem(true)
    setThemeState(sys)
    apply(sys)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, isSystem, toggle, setTheme, useSystem }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return React.useContext(ThemeContext)
}
