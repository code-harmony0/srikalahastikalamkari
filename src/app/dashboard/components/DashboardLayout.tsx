"use client";

import React, { useEffect } from "react";
import Sidebar from "./Sidebar";
import { Toaster } from "@/shared/ui/toaster";
import "../styles/dashboard.css";
import "../styles/tables.css";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  useEffect(() => {
    document.body.classList.add("dashboard");
    return () => {
      document.body.classList.remove("dashboard");
    };
  }, []);

  return (
    <div className="dashboard-root">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
      <Toaster />
    </div>
  );
}

export default DashboardLayout;
