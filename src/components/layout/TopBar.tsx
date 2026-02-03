"use client";

import * as React from "react";
import { Search, Bell, User } from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";
import { cn } from "@/shared/utils";

/**
 * Top Bar Component
 * 
 * Top navigation bar with strict visual neutrality.
 * 
 * Critical Constraints:
 * - Height: 72px (fixed)
 * - Position: sticky
 * - No gradients, accent colors, or elevation beyond base shadow
 * - Notification badges: gray scale only
 * - Search collapses to icon-only at ≤1280px
 */

export interface TopBarProps {
  onMenuClick?: () => void;
  className?: string;
}

export function TopBar({ onMenuClick, className }: TopBarProps) {
  const [searchExpanded, setSearchExpanded] = React.useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 h-18 px-6", // 72px height
        "bg-white dark:bg-gray-800",
        "border-b border-gray-200 dark:border-gray-700",
        "shadow-[0_1px_3px_rgba(0,0,0,0.1)]", // base shadow only
        className
      )}
    >
      <div className="flex items-center justify-between h-full gap-4">
        {/* Left Section: Logo */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Kalamkari Dashboard
          </h1>
        </div>

        {/* Right Section: Search, Notifications, User, Theme Toggle */}
        <div className="flex items-center gap-4">
          {/* Search - collapses at ≤1280px */}
          <div className="hidden xl:block">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
              />
            </div>
          </div>

          {/* Search Icon Only (≤1280px) */}
          <button
            className="xl:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Notifications - gray scale only */}
          <button
            className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {/* Gray scale badge only */}
            <span className="absolute top-2 right-2 w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full" />
          </button>

          {/* User Menu */}
          <button
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
            aria-label="User menu"
          >
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
