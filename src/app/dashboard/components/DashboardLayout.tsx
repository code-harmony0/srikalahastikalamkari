"use client"

import React from "react"
import Sidebar from "./Sidebar"
import { useSidebar, SidebarProvider } from "@/shared/contexts/SidebarContext"
import { Menu } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

function MainContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed, toggleSidebar } = useSidebar()
  return (
    <main
      className={`main-content transition-all duration-300 ease-in-out w-full lg:w-auto ${isCollapsed ? "lg:ml-[80px]" : "lg:ml-[280px]"} p-4 md:p-6 lg:p-8 pt-20 lg:pt-8`}
    >
      {children}
    </main>
  )
}

function DashboardLayoutContent({ children }: DashboardLayoutProps) {
  const { isCollapsed, toggleSidebar } = useSidebar()
  return (
    <div className="dashboard-root">
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40 flex items-center px-4 justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-slate-900">Kalamkari Admin</span>
        </div>
      </div>

      <div
        className={`lg:hidden sidebar-overlay ${!isCollapsed ? "visible" : ""}`}
        onClick={() => !isCollapsed && toggleSidebar()}
      />

      <Sidebar />
      <MainContent>{children}</MainContent>
    </div>
  )
}

function DashboardLayout(props: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent {...props} />
    </SidebarProvider>
  )
}

export default DashboardLayout
