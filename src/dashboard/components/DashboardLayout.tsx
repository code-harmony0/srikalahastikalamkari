"use client";

import React from "react";
import Sidebar from "./Sidebar";
import { Toaster } from "@/shared/ui/toaster";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
      <Toaster />
    </div>
  );
}

export default DashboardLayout;
