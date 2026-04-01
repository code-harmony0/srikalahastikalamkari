"use client"

import { usePathname } from "next/navigation"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import FloatingAdminButton from "@/components/layout/FloatingAdminButton"
import { WhatsAppButton } from "@/shared/components/WhatsAppButton"

export default function AppWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin")

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5DC]">
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
