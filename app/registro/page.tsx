"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, Lock, Mail, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TextField } from "@/components/ui/text-field"
import { PhoneFrame } from "@/components/phone-frame"
import { CumbrevaLogo } from "@/components/cumbreva-logo"
import { Spinner } from "@/components/ui/spinner"
import { useCumbreva } from "@/lib/cumbreva-context"

export default function RegisterPage() {
  const router = useRouter()
  const { dispatch } = useCumbreva()
  const [form, setForm] = React.useState({ name: "", email: "", password: "", confirm: "" })
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(false)

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = "Cuéntanos cómo te llamas."
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Ingresa un correo válido."
    if (form.password.length < 8) next.password = "La contraseña debe tener mínimo 8 caracteres."
    if (form.password !== form.confirm) next.confirm = "Las contraseñas no coinciden."
    setErrors(next)
    if (Object.keys(next).length) return

    setLoading(true)
    setTimeout(() => {
      dispatch({ type: "LOGIN", name: form.name.split(" ")[0] })
      toast.success("Cuenta creada", { description: "Vamos a registrar tu vehículo." })
      router.replace("/vehiculo/nuevo")
    }, 800)
  }

  return (
    <PhoneFrame noBottomPad>
      <div className="flex min-h-dvh flex-col px-6 pb-8 pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 flex h-11 w-11 items-center justify-center rounded-full text-foreground hover:bg-overlay-hover active:scale-95 transition"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="mb-10 flex flex-col items-start gap-5">
          <CumbrevaLogo />
          <div>
            <h1 className="text-display text-balance">Crea tu cuenta</h1>
            <p className="mt-2 text-sm text-foreground-muted">
              Empieza a planear tus cargas y rutas en minutos.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5" noValidate>
          <TextField id="name" label="Nombre" error={errors.name} leadingIcon={<User />} size="lg">
            <Input
              value={form.name}
              onChange={update("name")}
              placeholder="Tu nombre"
              autoComplete="name"
            />
          </TextField>
          <TextField id="email" label="Correo" error={errors.email} leadingIcon={<Mail />} size="lg">
            <Input
              type="email"
              inputMode="email"
              value={form.email}
              onChange={update("email")}
              placeholder="tu@correo.com"
              autoComplete="email"
            />
          </TextField>
          <TextField
            id="password"
            label="Contraseña"
            error={errors.password}
            helper={!errors.password ? "Mínimo 8 caracteres" : undefined}
            leadingIcon={<Lock />}
            size="lg"
          >
            <Input
              type="password"
              value={form.password}
              onChange={update("password")}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </TextField>
          <TextField
            id="confirm"
            label="Confirmar contraseña"
            error={errors.confirm}
            leadingIcon={<Lock />}
            size="lg"
          >
            <Input
              type="password"
              value={form.confirm}
              onChange={update("confirm")}
              placeholder="Repite tu contraseña"
              autoComplete="new-password"
            />
          </TextField>

          <Button type="submit" disabled={loading} size="lg" className="mt-3 w-full">
            {loading ? <Spinner className="h-5 w-5" /> : "Crear cuenta"}
          </Button>

          <Link
            href="/login"
            className="mt-auto pt-6 text-center text-sm text-foreground-muted hover:text-foreground"
          >
            ¿Ya tienes cuenta? <span className="font-semibold text-primary">Inicia sesión</span>
          </Link>
        </form>
      </div>
    </PhoneFrame>
  )
}
