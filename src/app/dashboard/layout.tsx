"use client";

import { usePathname } from "next/navigation";
import DashboardLayout from "@/app/dashboard/components/DashboardLayout";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Don't wrap login page with dashboard layout
  if (pathname === "/dashboard/login") {
    return <>{children}</>;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
