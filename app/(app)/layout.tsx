import type * as React from "react"
import { PhoneFrame } from "@/components/phone-frame"
import { BottomNav } from "@/components/bottom-nav"

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <PhoneFrame>
      {children}
      <BottomNav />
    </PhoneFrame>
  )
}
