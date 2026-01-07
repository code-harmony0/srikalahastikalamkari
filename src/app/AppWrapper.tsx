"use client";

import { usePathname } from "next/navigation";
import Header from "@/storefront/components/layout/Header";
import Footer from "@/storefront/components/layout/Footer";
import FloatingAdminButton from "@/storefront/components/layout/FloatingAdminButton"; // Re-importing the button

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
          <FloatingAdminButton /> {/* Adding the button back inside the conditional block */}
        </>
      )}
    </div>
  );
}