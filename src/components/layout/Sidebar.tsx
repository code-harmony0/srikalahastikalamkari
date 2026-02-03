"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  BarChart3,
} from "lucide-react";
import { cn } from "@/shared/utils";

/**
 * Sidebar Component
 * 
 * Navigation sidebar with responsive behavior.
 * 
 * Specifications:
 * - Width: 260px (desktop), 220px (tablet), drawer overlay (mobile)
 * - Navigation items: 44px height, 12px 16px padding, 8px border radius
 * - States: default (transparent), hover (gray-100/700), active (primary-50/900)
 */

export interface SidebarProps {
  className?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: "Products",
    href: "/dashboard/products",
    icon: <Package className="h-5 w-5" />,
  },
  {
    label: "Orders",
    href: "/dashboard/orders",
    icon: <ShoppingCart className="h-5 w-5" />,
  },
  {
    label: "Customers",
    href: "/dashboard/customers",
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-18 h-[calc(100vh-72px)] z-40",
        "w-[260px] lg:w-[260px] md:w-[220px]", // Responsive width
        "bg-white dark:bg-gray-800",
        "border-r border-gray-200 dark:border-gray-700",
        "p-6 py-4",
        className
      )}
    >
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 h-11 px-4 rounded-lg", // 44px height, 12px 16px padding, 8px radius
                "text-sm font-medium transition-colors",
                isActive
                  ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400" // Active state
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700" // Default and hover
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
