"use client";

import React from "react";
import Sidebar from "./Sidebar";
import { Toaster } from "@/shared/ui/toaster";
import { SidebarProvider, useSidebar } from "@/shared/contexts/SidebarContext";
import "../styles/dashboard.css";
import "../styles/tables.css";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function MainContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  return (
    <main className={`main-content transition-all duration-300 ease-in-out ${isCollapsed ? 'ml-[80px]' : 'ml-[280px]'}`}>
      {children}
    </main>
  );
}

function DashboardLayoutContent({ children }: DashboardLayoutProps) {
  return (
    <div className="dashboard-root">
      <Sidebar />
      <MainContent>
        {children}
      </MainContent>
      <Toaster />
    </div>
  );
}

function DashboardLayout(props: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent {...props} />
    </SidebarProvider>
  );
}

export default DashboardLayout;
