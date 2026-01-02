"use client"

import React from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import {
  FiGrid,
  FiBox,
  FiClipboard,
  FiPlusSquare,
  FiLogOut,
  FiTag,
} from "react-icons/fi"
import "./Sidebar.css"
import { useAuth } from "@/shared/contexts/AuthContext"
import { signOut } from "firebase/auth"
import { auth } from "@/shared/config/firebase"
import { useToast } from "@/shared/ui/use-toast"

const Sidebar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const role = user?.metadata?.role

  const { toast } = useToast()

  const handleLogout = async () => {
    await logout()
    localStorage.removeItem("isLoggedIn") // Clear legacy auth just in case
    router.push("/dashboard/login")
  }

  const menuItems = [
    {
      to: "/dashboard/dashboard-home",
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
  ]

  // const filteredItems = menuItems.filter(
  // (item) =>
  // Filter items based on user roles
  // !item.roles || (role && item.roles.includes(role))
  // )
  const filteredItems = menuItems // Show all items for debu

  return (
    <div className="sidebar">
      <div className="sidebar-content">
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">KK</div>
            <div>
              <h2 className="brand-name">Kailash Kalamkari</h2>
              <p className="brand-subtitle">Admin Panel</p>
              {role && (
                <span className="text-xs text-gray-400 capitalize">
                  {role.replace("_", " ")}
                </span>
              )}
            </div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <ul>
            {filteredItems.map((item) => (
              <li key={item.to}>
                <Link
                  href={item.to}
                  className={pathname === item.to ? "active" : ""}
                >
                  <item.icon className="nav-icon" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <FiLogOut className="logout-icon" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
