"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Bell,
  ChevronRight,
  CreditCard,
  Gift,
  HelpCircle,
  Home,
  Leaf,
  LogOut,
  Moon,
  Settings,
  Share2,
  Shield,
  Sparkles,
  Sun,
  User,
  Zap,
} from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePlugo } from "@/lib/plugo-context"
import { useTheme } from "@/lib/theme-context"
import { cn } from "@/lib/utils"

const menuSections = [
  {
    title: "Cuenta",
    items: [
      { Icon: User, label: "Datos personales", href: "/perfil" },
      { Icon: CreditCard, label: "Métodos de pago", href: "/perfil" },
      { Icon: Bell, label: "Notificaciones", href: "/perfil/preferencias" },
      { Icon: Settings, label: "Preferencias", href: "/perfil/preferencias" },
    ],
  },
  {
    title: "PLUGO",
    items: [
      { Icon: Gift, label: "Recompensas", href: "/perfil/recompensas", badge: "180 PC" },
      { Icon: Home, label: "Modo Anfitrión", href: "/perfil/anfitrion", badge: "Nuevo" },
      { Icon: Share2, label: "Invita y gana", href: "/perfil" },
    ],
  },
  {
    title: "Soporte",
    items: [
      { Icon: HelpCircle, label: "Centro de ayuda", href: "#" },
      { Icon: Shield, label: "Privacidad y seguridad", href: "#" },
    ],
  },
]

export default function PerfilPage() {
  const router = useRouter()
  const { state, dispatch } = usePlugo()
  const v = state.vehicle

  const { theme, toggle: toggleTheme } = useTheme()

  return (
    <div className="space-y-5 px-5 pb-6 pt-5">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">Perfil</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Mi cuenta</h1>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition active:scale-95"
        >
          {theme === "dark" ? <Sun className="h-5 w-5 text-[#ffd21f]" /> : <Moon className="h-5 w-5 text-foreground-muted" />}
        </button>
      </header>

      <GlassCard variant="strong">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border border-border">
            <AvatarImage src="/user-avatar-male.png" alt="" />
            <AvatarFallback className="bg-primary/20 text-primary text-lg">
              {(state.userName || "U")[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold">{state.userName || "Conductor"}</p>
            <p className="truncate text-xs text-foreground-muted">conductor@plugo.app</p>
            <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
              <Sparkles className="h-2.5 w-2.5" />
              Explorador
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border/60 pt-4">
          <ProfileStat Icon={Zap} label="Cargas" value="14" />
          <ProfileStat Icon={Leaf} label="CO₂" value="42 kg" tone="success" />
          <ProfileStat Icon={Gift} label="PlugoCoins" value={state.plugoCoins.toString()} />
        </div>
      </GlassCard>

      <Link
        href="/perfil/anfitrion"
        className="block overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card to-card p-4 transition hover:border-primary/50"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-primary">
            <Home className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Comparte tu cargador</p>
            <p className="mt-0.5 text-xs text-foreground-muted">
              Recibe ingresos rentando tu wallbox a la comunidad.
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-primary" />
        </div>
      </Link>

      <div className="space-y-2">
        <p className="px-1 text-[10px] font-semibold uppercase tracking-widest text-foreground-soft">
          Mis vehículos
        </p>
        <div className="space-y-2">
          {v ? (
            <Link
              href="/mi-vehiculo"
              className="flex items-center gap-3 rounded-3xl border border-border bg-card p-3 transition hover:border-primary/40"
            >
              <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-2xl bg-background-secondary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={v.photo || "/vehicle-byd-seagull-side-dark.jpg"}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {v.brand} {v.model}
                </p>
                <p className="text-[11px] text-foreground-muted">
                  {v.plate || "Sin placa"} · {v.year || "—"}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-foreground-muted" />
            </Link>
          ) : (
            <p className="rounded-3xl border border-dashed border-border bg-card/50 px-3 py-3 text-center text-xs text-foreground-muted">
              Aún no has registrado un vehículo.
            </p>
          )}
          <button
            type="button"
            onClick={() => router.push("/vehiculo/nuevo")}
            className="flex w-full items-center justify-center gap-2 rounded-3xl border border-dashed border-border bg-card/50 px-3 py-3 text-xs font-medium text-foreground-muted transition hover:border-primary/50"
          >
            + Agregar vehículo
          </button>
        </div>
      </div>

      {menuSections.map((section) => (
        <div key={section.title} className="space-y-2">
          <p className="px-1 text-[10px] font-semibold uppercase tracking-widest text-foreground-soft">
            {section.title}
          </p>
          <div className="overflow-hidden rounded-3xl border border-border bg-card">
            {section.items.map((item, i) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 transition hover:bg-white/[0.03]",
                  i !== section.items.length - 1 && "border-b border-border/60",
                )}
              >
                <item.Icon className="h-4 w-4 text-foreground-muted" />
                <span className="flex-1 text-sm">{item.label}</span>
                {"badge" in item && item.badge && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-primary">
                    {item.badge}
                  </span>
                )}
                <ChevronRight className="h-4 w-4 text-foreground-muted" />
              </Link>
            ))}
          </div>
        </div>
      ))}

      <Button
        variant="outline"
        className="h-12 w-full rounded-2xl border-border bg-card text-destructive"
        onClick={() => {
          dispatch({ type: "LOGOUT" })
          router.push("/")
        }}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Cerrar sesión
      </Button>

      <p className="text-center text-[10px] text-foreground-soft">PLUGO v1.0.0 · Hecho en Colombia</p>
    </div>
  )
}

function ProfileStat({
  Icon,
  label,
  value,
  tone,
}: {
  Icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  tone?: "success" | "default"
}) {
  return (
    <div>
      <Icon className={cn("mb-1 h-3.5 w-3.5", tone === "success" ? "text-success" : "text-primary")} />
      <p className="text-[10px] uppercase tracking-wider text-foreground-soft">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums">{value}</p>
    </div>
  )
}
