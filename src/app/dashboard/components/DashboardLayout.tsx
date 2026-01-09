"use client";

import React from "react";
import Sidebar from "./Sidebar";
import { Toaster } from "@/shared/ui/toaster";
import "../styles/dashboard.css";
import "../styles/tables.css";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {
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
