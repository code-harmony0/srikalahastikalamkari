"use client";

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  FiGrid,
  FiBox,
  FiClipboard,
  FiPlusSquare,
  FiLogOut,
  FiTag,
  FiChevronLeft,
  FiChevronRight,
  FiShoppingBag,
  FiMessageSquare,
  FiStar,
  FiPercent,
  FiHeart,
} from "react-icons/fi"
import "./Sidebar.css"
import { useAuth } from "@/shared/contexts/AuthContext"
import { useSidebar } from "@/shared/contexts/SidebarContext"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip"

const Sidebar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { isCollapsed, toggleSidebar } = useSidebar()
  const role = (user as any)?.metadata?.role

  

  const handleLogout = async () => {
    await logout()
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userRole")
    localStorage.removeItem("rememberMe")
    // Clear cookie
    document.cookie = "isLoggedIn=; path=/; max-age=0"
    router.push("/dashboard/login")
  }

  const menuItems = [
    {
      to: "/dashboard",
      icon: FiGrid,
      label: "Dashboard",
      roles: ["super_admin", "admin"],
    },
    {
      to: "/dashboard/products",
      icon: FiBox,
      label: "Products",
      roles: ["super_admin", "admin"],
    },
    {
      to: "/dashboard/add-product",
      icon: FiPlusSquare,
      label: "Add Product",
      roles: ["super_admin"],
    },
    {
      to: "/dashboard/categories",
      icon: FiTag,
      label: "Categories",
      roles: ["super_admin"],
    },
    {
      to: "/dashboard/orders",
      icon: FiClipboard,
      label: "Orders",
      roles: ["super_admin", "admin"],
    },
    {
      to: "/dashboard/featured",
      icon: FiStar,
      label: "Featured",
      roles: ["super_admin", "admin"],
    },
    {
      to: "/dashboard/inquiries",
      icon: FiMessageSquare,
      label: "Inquiries",
      roles: ["super_admin", "admin"],
    },
    {
      to: "/dashboard/coupons",
      icon: FiPercent,
      label: "Coupons",
      roles: ["super_admin"],
    },
    {
      to: "/dashboard/reviews",
      icon: FiHeart,
      label: "Reviews",
      roles: ["super_admin", "admin"],
    },
  ]

  const filteredItems = menuItems

  return (
    <motion.div
      className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8
      }}
    >
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-[-1]"
          onClick={() => toggleSidebar()}
        />
      )}
      <div className="sidebar-content">
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon shrink-0">
              <FiShoppingBag className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <h2 className="brand-name">Srikalahasti Kalamkari</h2>
                <p className="brand-subtitle">Admin Panel</p>
                {role && (
                  <span className="text-xs text-gray-400 capitalize">
                    {role.replace("_", " ")}
                  </span>
                )}
              </motion.div>
            )}
          </div>
          
          <button 
            className="sidebar-toggle-btn"
            onClick={toggleSidebar}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <TooltipProvider delayDuration={0}>
            <ul>
              {filteredItems.map((item) => (
                <li key={item.to}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.to}
                        className={pathname === item.to ? "active" : ""}
                      >
                        <item.icon className="nav-icon" />
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </Link>
                    </TooltipTrigger>
                    {isCollapsed && (
                      <TooltipContent side="right">
                        {item.label}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </li>
              ))}
            </ul>
          </TooltipProvider>
        </nav>
      </div>

      <div className="sidebar-footer">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="logout-btn" onClick={handleLogout}>
                <FiLogOut className="logout-icon shrink-0" />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    Logout
                  </motion.span>
                )}
              </button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">
                Logout
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </motion.div>
  )
}

export default Sidebar
