import type * as React from "react"
import { PhoneFrame } from "@/components/phone-frame"
import { BottomNav } from "@/components/bottom-nav"
import { PageTransition } from "@/components/page-transition"

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <PhoneFrame>
      <PageTransition>{children}</PageTransition>
      <BottomNav />
    </PhoneFrame>
  )
}
