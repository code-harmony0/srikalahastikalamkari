"use client"

import { usePathname } from "next/navigation"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import FloatingAdminButton from "@/components/layout/FloatingAdminButton"
import { WhatsAppButton } from "@/shared/components/WhatsAppButton"
import { cn } from "@/shared/utils"

export default function AppWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin")

  return (
    <div className={cn(
      "flex flex-col min-h-screen",
      isAdminRoute
        ? "bg-white text-slate-900"
        : "bg-background kalamkari-static-background silk-fabric-texture text-[#1A1512]"
    )}>
      {!isAdminRoute && <Header />}
      <main className="flex-1">{children}</main>
      {!isAdminRoute && (
        <>
          <Footer />
          <FloatingAdminButton />
          <WhatsAppButton phoneNumber="917288848881" />
        </>
      )}
    </div>
  )
}
