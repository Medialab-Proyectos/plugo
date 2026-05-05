"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TextField } from "@/components/ui/text-field"
import { PhoneFrame } from "@/components/phone-frame"
import { PlugoLogo } from "@/components/plugo-logo"
import { Spinner } from "@/components/ui/spinner"
import { Mail, ArrowLeft, Lock } from "lucide-react"
import { usePlugo } from "@/lib/plugo-context"
import { GoogleIcon, AppleIcon } from "@/components/brand-icons"

export default function LoginPage() {
  const router = useRouter()
  const { dispatch } = usePlugo()
  const [mode, setMode] = React.useState<"social" | "email">("social")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({})

  const handleSocial = (provider: "Google" | "Apple") => {
    setLoading(true)
    setTimeout(() => {
      dispatch({ type: "LOGIN", name: "Camilo" })
      toast.success(`Sesión iniciada con ${provider}`)
      router.replace("/vehiculo/nuevo")
    }, 700)
  }

  const handleEmail = (e: React.FormEvent) => {
    e.preventDefault()
    const next: typeof errors = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Ingresa un correo válido."
    if (password.length < 8) next.password = "Mínimo 8 caracteres."
    setErrors(next)
    if (Object.keys(next).length) return

    setLoading(true)
    setTimeout(() => {
      dispatch({ type: "LOGIN", name: email.split("@")[0] || "Conductor" })
      toast.success("Bienvenido a Plugo")
      router.replace("/vehiculo/nuevo")
    }, 700)
  }

  return (
    <PhoneFrame noBottomPad>
      <div className="flex min-h-dvh flex-col px-6 pb-8 pt-6">
        {/* Top: ghost back button (now visually distinct from inputs) */}
        <button
          type="button"
          onClick={() => (mode === "email" ? setMode("social") : router.back())}
          className="mb-6 flex h-11 w-11 items-center justify-center rounded-full text-foreground hover:bg-white/[0.06] active:scale-95 transition"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="mb-10 flex flex-col items-start gap-5">
          <PlugoLogo />
          <div>
            <h1 className="text-display text-balance">Bienvenido a Plugo</h1>
            <p className="mt-2 text-sm text-foreground-muted">Tu ecosistema EV, siempre contigo.</p>
          </div>
        </div>

        {mode === "social" ? (
          <div className="flex flex-1 flex-col gap-3">
            {/* Secondary (white surface) — distinct from primary CTA */}
            <Button
              onClick={() => handleSocial("Google")}
              disabled={loading}
              variant="secondary"
              size="lg"
              className="w-full"
            >
              <GoogleIcon className="h-5 w-5" />
              Continuar con Google
            </Button>
            <Button
              onClick={() => handleSocial("Apple")}
              disabled={loading}
              size="lg"
              className="w-full bg-foreground text-background hover:bg-foreground/90 shadow-[0_4px_16px_-8px_rgba(255,255,255,0.2)]"
            >
              <AppleIcon className="h-5 w-5" />
              Continuar con Apple
            </Button>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-overline text-foreground-soft">o con correo</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <Button
              onClick={() => setMode("email")}
              variant="outline"
              size="lg"
              className="w-full"
            >
              <Mail className="h-5 w-5" />
              Continuar con correo
            </Button>

            <div className="mt-auto pt-8 text-center">
              <span className="text-sm text-foreground-muted">¿No tienes cuenta? </span>
              <Link href="/registro" className="text-sm font-semibold text-primary hover:underline">
                Crear cuenta
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleEmail} className="flex flex-1 flex-col gap-5" noValidate>
            <TextField
              id="email"
              label="Correo"
              error={errors.email}
              leadingIcon={<Mail />}
              size="lg"
            >
              <Input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
              />
            </TextField>

            <TextField
              id="password"
              label="Contraseña"
              error={errors.password}
              leadingIcon={<Lock />}
              size="lg"
            >
              <Input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
              />
            </TextField>

            <Button
              type="submit"
              disabled={loading}
              size="lg"
              className="mt-2 w-full"
            >
              {loading ? <Spinner className="h-5 w-5" /> : "Iniciar sesión"}
            </Button>

            <Link
              href="/registro"
              className="mt-auto pt-6 text-center text-sm text-foreground-muted hover:text-foreground"
            >
              ¿No tienes cuenta? <span className="font-semibold text-primary">Crear cuenta</span>
            </Link>
          </form>
        )}
      </div>
    </PhoneFrame>
  )
}
