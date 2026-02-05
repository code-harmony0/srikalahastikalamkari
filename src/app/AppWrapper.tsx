"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingAdminButton from "@/components/layout/FloatingAdminButton";
import { WhatsAppButton } from "@/shared/components/WhatsAppButton";

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboardRoute = pathname.startsWith("/dashboard");

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5DC]">
      {!isDashboardRoute && <Header />}
      <main className="flex-1">{children}</main>
      {!isDashboardRoute && (
        <>
          <Footer />
          <FloatingAdminButton />
          <WhatsAppButton phoneNumber="919876543210" />
        </>
      )}
    </div>
  );
}