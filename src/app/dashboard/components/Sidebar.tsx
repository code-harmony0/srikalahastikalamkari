"use client"

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
  FiUser,
} from "react-icons/fi"
import "./Sidebar.css"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/shared/contexts/AuthContext"
import { useSidebar } from "@/shared/contexts/SidebarContext"
import { toast } from "sonner"

const Sidebar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { isCollapsed, toggleSidebar } = useSidebar()
  const role = (user as any)?.metadata?.role

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error("Logout request failed")
      }

      // Admin uses cookie-based auth — do NOT call firebaseSignOut here.
      // Calling it would sign out ANY Firebase user on the same device,
      // including storefront customers logged in via phone OTP.
      localStorage.removeItem("isLoggedIn")
      localStorage.removeItem("userRole")
      localStorage.removeItem("rememberMe")
      sessionStorage.removeItem("isLoggedIn")
      sessionStorage.removeItem("userRole")
      // The session cookie is httpOnly; the logout endpoint above clears it.
      window.location.href = "/admin/login"
    } catch {
      toast.error("Could not log out. Please try again.")
    }
  }

  const [pendingOrders, setPendingOrders] = useState(0)
  const [lowStockCount, setLowStockCount] = useState(0)
  const [pendingReviews, setPendingReviews] = useState(0)
  const [newInquiries, setNewInquiries] = useState(0)
  const [activeCoupons, setActiveCoupons] = useState(0)

  useEffect(() => {
    const fetchBadges = async () => {
      // Pending orders
      const { count: pendingCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .in("status", ["pending", "paid"])

      // Out-of-stock products. Most pieces are one-of-a-kind with a stock of 1,
      // so the old "fewer than 5" rule flagged almost the whole catalogue.
      const { count: stockCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .lte("stock_quantity", 0)

      // Pending reviews (not approved)
      // @ts-ignore - reviews table exists but not in generated types
      const { count: reviewsCount } = await (supabase as any)
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("is_approved", false)

      // New contact messages. The contact form writes to `contact_inquiries`
      // with status "new"; this used to query a table named `inquiries` that
      // does not exist, so every admin page logged a 404 and the badge stayed 0.
      const { count: inquiriesCount } = await (supabase as any)
        .from("contact_inquiries")
        .select("*", { count: "exact", head: true })
        .eq("status", "new")

      // Active coupons - count all active coupons (with no expiry or future expiry)
      // @ts-ignore - coupons table exists but not in generated types
      const { count: couponsCount } = await (supabase as any)
        .from("coupons")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)

      setPendingOrders(pendingCount || 0)
      setLowStockCount(stockCount || 0)
      setPendingReviews(reviewsCount || 0)
      setNewInquiries(inquiriesCount || 0)
      setActiveCoupons(couponsCount || 0)
    }
    fetchBadges()
  }, [])

  const menuItems = [
    {
      to: "/dashboard",
      icon: FiGrid,
      label: "Dashboard",
      roles: ["super_admin", "admin"],
    },
    {
      to: "/dashboard/orders",
      icon: FiClipboard,
      label: "Orders",
      roles: ["super_admin", "admin"],
      badge: pendingOrders > 0 ? pendingOrders : null,
      badgeColor: "bg-red-600",
    },
    {
      to: "/dashboard/products",
      icon: FiBox,
      label: "Products",
      roles: ["super_admin", "admin"],
      badge: lowStockCount > 0 ? lowStockCount : null,
      badgeColor: "bg-red-500",
    },
    {
      to: "/dashboard/categories",
      icon: FiTag,
      label: "Categories",
      roles: ["super_admin"],
    },
    {
      to: "/dashboard/add-product",
      icon: FiPlusSquare,
      label: "Add Product",
      roles: ["super_admin"],
    },
    {
      to: "/dashboard/inquiries",
      icon: FiMessageSquare,
      label: "Inquiries",
      roles: ["super_admin", "admin"],
      badge: newInquiries > 0 ? newInquiries : null,
      badgeColor: "bg-blue-600",
    },

    {
      to: "/dashboard/featured",
      icon: FiStar,
      label: "Featured",
      roles: ["super_admin", "admin"],
    },
    {
      to: "/dashboard/coupons",
      icon: FiPercent,
      label: "Coupons",
      roles: ["super_admin"],
      badge: activeCoupons > 0 ? activeCoupons : null,
      badgeColor: "bg-red-600",
    },
    {
      to: "/dashboard/reviews",
      icon: FiHeart,
      label: "Reviews",
      roles: ["super_admin", "admin"],
      badge: pendingReviews > 0 ? pendingReviews : null,
      badgeColor: "bg-amber-600",
    },
  ]

  const filteredItems = menuItems

  return (
    <div
      className={`sidebar ${isCollapsed ? "collapsed" : "mobile-open"}`}
      style={{ width: isCollapsed ? 80 : 280 }}
    >
      <div className="sidebar-content">
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon shrink-0 bg-slate-100 flex items-center justify-center overflow-hidden rounded-xl border border-slate-200">
              <img 
                src="https://ui-avatars.com/api/?name=SK&background=000000&color=fff&size=128&font-size=0.35&bold=true" 
                alt="Admin Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="brand-name">Srikalahasti Kalamkari</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="h-4 w-4 overflow-hidden rounded-full border border-slate-200 flex-shrink-0">
                    <img 
                      src="https://ui-avatars.com/api/?name=SK&background=000000&color=fff&size=32" 
                      alt="Admin" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="brand-subtitle text-slate-500">
                    Admin Panel {role && `- ${role.replace("_", " ")}`}
                  </span>
                </div>
              </div>
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
          <ul>
            {filteredItems.map((item) => (
              <li key={item.to}>
                <Link
                  href={item.to}
                  title={isCollapsed ? item.label : ""}
                  className={`${pathname === item.to ? "active" : ""} relative`}
                >
                  <item.icon className="nav-icon" />
                  {/* Badge for collapsed state - show count on icon */}
                  {isCollapsed &&
                    item.badge != null &&
                    item.badge > 0 && (
                      <span
                        className={`absolute -top-1.5 -right-1.5 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-md ${
                          item.badgeColor || "bg-[#C19A5B]"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  {!isCollapsed && (
                    <span className="flex items-center w-full">
                      {item.label}
                      {/* @ts-ignore */}
                      {item.badge > 0 && (
                        <span
                          className={`ml-auto text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                            // @ts-ignore
                            item.badgeColor || "bg-[#C19A5B]"
                          }`}
                        >
                          {/* @ts-ignore */}
                          {item.badge}
                        </span>
                      )}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="sidebar-footer">
        <button 
          className="logout-btn" 
          onClick={handleLogout}
          title={isCollapsed ? "Logout" : ""}
        >
          <FiLogOut className="logout-icon shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  )
}

export default Sidebar
