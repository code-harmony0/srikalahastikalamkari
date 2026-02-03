"use client";

import * as React from "react";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";
import { cn } from "@/shared/utils";

/**
 * App Shell Layout
 * 
 * Main layout structure for the dashboard.
 * 
 * Specifications:
 * - Fixed sidebar (260px desktop, 220px tablet, drawer mobile)
 * - Content max-width: 1440px
 * - Padding: 24px (desktop), 20px (tablet), 16px (mobile)
 * - Header-to-content spacing: 24px
 * - Sidebar-to-content spacing: 24px
 */

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Bar */}
      <TopBar />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main
        className={cn(
          "ml-[260px] lg:ml-[260px] md:ml-[220px]", // Sidebar spacing
          "pt-6", // 24px header-to-content spacing
          "min-h-[calc(100vh-72px)]"
        )}
      >
        <div
          className={cn(
            "max-w-[1440px] mx-auto", // Content max-width
            "px-6 md:px-5 sm:px-4" // Responsive padding: 24px desktop, 20px tablet, 16px mobile
          )}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
