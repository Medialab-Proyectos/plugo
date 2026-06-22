import type { CapacitorConfig } from "@capacitor/cli"

const appUrl = process.env.CAPACITOR_APP_URL || "http://10.0.2.2:3000"
const isLocalUrl = appUrl.startsWith("http://")

const config: CapacitorConfig = {
  appId: "com.cumbreva.app",
  appName: "CUMBREVA",
  webDir: ".next",
  server: {
    url: appUrl,
    cleartext: isLocalUrl,
    androidScheme: isLocalUrl ? "http" : "https",
  },
  android: {
    allowMixedContent: isLocalUrl,
    backgroundColor: "#070b10",
  },
}

export default config
