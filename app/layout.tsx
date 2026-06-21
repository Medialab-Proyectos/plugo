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
    "PLUGO es el ecosistema premium para propietarios de vehículos eléctricos en Colombia y Latinoamérica. Encuentra electrolineras, calcula tu autonomía real según la geografía y planea rutas sin ansiedad.",
  generator: "v0.app",
  applicationName: "PLUGO",
  keywords: ["EV", "vehículo eléctrico", "electrolineras", "autonomía", "Colombia", "PLUGO", "movilidad eléctrica"],
}

export const viewport: Viewport = {
  themeColor: "#F5F7F9",
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
    <html lang="es" className={`${inter.variable} ${jetbrains.variable} bg-background`} suppressHydrationWarning>
      <head>
        {/* Anti-flash: aplica el tema antes del primer paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('plugo:theme');var light=t?t==='light':true;var d=document.documentElement;d.classList.toggle('light',light);var meta=document.querySelector('meta[name=theme-color]');if(meta)meta.setAttribute('content',light?'#f5f7f9':'#070b10');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <PlugoProvider>
            <div className="min-h-dvh w-full">{children}</div>
            <Toaster position="top-center" />
          </PlugoProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
