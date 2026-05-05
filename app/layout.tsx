import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import { PlugoProvider } from "@/lib/plugo-context"
import { ThemeProvider } from "@/lib/theme-context"
import "./globals.css"

const inter = localFont({
  src: [
    { path: "../public/Dominio/letra/Inter_28pt-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/Dominio/letra/Inter_28pt-Medium.ttf", weight: "500", style: "normal" },
    { path: "../public/Dominio/letra/Inter_28pt-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../public/Dominio/letra/Inter_28pt-Bold.ttf", weight: "700", style: "normal" },
    { path: "../public/Dominio/letra/Inter_28pt-ExtraBold.ttf", weight: "800", style: "normal" },
    { path: "../public/Dominio/letra/Inter_28pt-Black.ttf", weight: "900", style: "normal" },
  ],
  variable: "--font-sans-plugo",
  display: "swap",
})

const jetbrains = localFont({
  src: "../public/Dominio/letra/Inter_28pt-Regular.ttf",
  variable: "--font-mono-plugo",
  display: "swap",
})

export const metadata: Metadata = {
  title: "PLUGO — Carga sin ansiedad. Viaja sin límites.",
  description:
    "PLUGO es el ecosistema premium para propietarios de vehículos eléctricos en Colombia y Latinoamérica. Encuentra cargadores, planea rutas y construye comunidad.",
  generator: "v0.app",
  applicationName: "PLUGO",
  keywords: ["EV", "vehículo eléctrico", "cargadores", "Colombia", "PLUGO", "movilidad eléctrica"],
}

export const viewport: Viewport = {
  themeColor: "#070B10",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${jetbrains.variable} bg-background`}>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <PlugoProvider>
            <div className="min-h-dvh w-full">{children}</div>
            <Toaster
              position="top-center"
              theme="dark"
              toastOptions={{
                style: {
                  background: "rgba(11,15,20,0.95)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#ffffff",
                  backdropFilter: "blur(16px)",
                },
              }}
            />
          </PlugoProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
