"use client"

import React, { useEffect } from "react"
import Sidebar from "@/dashboard/components/Sidebar"
import { Toaster } from "@/shared/ui/toaster"
import "@/dashboard/styles/dashboard.css"
import "@/dashboard/styles/Sidebar.css"

interface DashboardLayoutProps {
  children: React.ReactNode
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  useEffect(() => {
    // Add data attribute to body to override background
    document.body.setAttribute("data-dashboard", "true")

    // Cleanup on unmount
    return () => {
      document.body.removeAttribute("data-dashboard")
    }
  }, [])

  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">{children}</main>
      <Toaster />
    </div>
  )
}

export default DashboardLayout
