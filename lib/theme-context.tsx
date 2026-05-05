"use client"

import * as React from "react"

type Theme = "dark" | "light"

const ThemeContext = React.createContext<{
  theme: Theme
  toggle: () => void
}>({
  theme: "dark",
  toggle: () => {},
})

const STORAGE_KEY = "plugo:theme"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>("dark")

  // Load stored preference on mount
  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (stored === "light" || stored === "dark") {
      setTheme(stored)
      document.documentElement.classList.toggle("light", stored === "light")
    }
  }, [])

  const toggle = React.useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark"
      localStorage.setItem(STORAGE_KEY, next)
      document.documentElement.classList.toggle("light", next === "light")
      return next
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return React.useContext(ThemeContext)
}
