"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Heart,
  Edit2,
  LogOut,
  ChevronRight,
  Clock,
  CheckCircle2,
  ShoppingBag,
} from "lucide-react"
import { cn, formatPrice } from "@/shared/utils"

import { useRouter } from "next/navigation"
import { useAuth } from "@/shared/contexts/AuthContext"
import { toast } from "sonner"

import { useUserProfileStore } from "@/shared/user-profile-store"

export default function ProfilePage() {
  const router = useRouter()
  const { signOut } = useAuth()
  const { profile: user } = useUserProfileStore()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success("Signed out successfully")
      router.push("/login")
    } catch (error) {
      toast.error("Failed to sign out")
    }
  }

  // Mock Orders Data
  const recentOrders: any[] = []

  // --- Helper Components ---

  const SidebarLink = ({ href, icon: Icon, label, active = false }: any) => (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-4 py-3.5 rounded-[10px] transition-all duration-200 group",
        active
          ? "bg-[#FFF4E8] border border-[#EAD6C3] shadow-sm"
          : "hover:bg-[#FFF8F0] border border-transparent hover:border-[#EAD6C3]/50",
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
          active
            ? "bg-[#A4552A] text-[#FFF8F0]"
            : "bg-[#FFF8F0] text-[#A4552A] group-hover:bg-[#A4552A]/10",
        )}
      >
        <Icon className="w-4 h-4" />
      </div>
      <span
        className={cn(
          "font-inter text-sm font-medium",
          active
            ? "text-[#A4552A]"
            : "text-[#3B2C23] group-hover:text-[#A4552A]",
        )}
      >
        {label}
      </span>
      <ChevronRight
        className={cn(
          "w-4 h-4 ml-auto transition-transform",
          active
            ? "text-[#A4552A]"
            : "text-[#EAD6C3] group-hover:text-[#A4552A] group-hover:translate-x-1",
        )}
      />
    </Link>
  )

  const InfoRow = ({ icon: Icon, label, value }: any) => (
    <div className="flex items-start gap-4 p-4 rounded-[12px] bg-[#FDFBF7] border border-[#EAD6C3]/40 hover:border-[#C19A5B]/30 transition-colors">
      <div className="w-10 h-10 rounded-full bg-[#FFF4E8] flex items-center justify-center shrink-0 border border-[#EAD6C3]/60 text-[#A4552A]">
        <Icon className="w-5 h-5" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-[11px] font-inter font-bold text-[#7A6A5C] uppercase tracking-wide mb-1">
          {label}
        </p>
        <p className="font-inter font-medium text-[#3B2C23] text-sm leading-snug">
          {value}
        </p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* ─────────────────────────────────────────────
          🌅 HERO SECTION (Clean Ivory Standard)
          Matches Shopping Cart Header
      ────────────────────────────────────────────── */}
      <section className="relative w-full flex flex-col items-center justify-center text-center px-6 overflow-hidden h-[160px] md:h-[220px] bg-[#FAF3EC] border-b border-[#EAD6C3]/60 shadow-[inset_0_-1px_0_rgba(0,0,0,0.02)]">
        {/* Subtle Top Fade Hint (Warmth) */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[#E8C3A2]/10 to-transparent pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center max-w-2xl mx-auto"
        >
          {/* Icon - Clean Terracotta */}
          <div className="mb-4">
            <User
              className="w-7 h-7 md:w-9 md:h-9 text-[#B35E2E]"
              strokeWidth={1.5}
            />
          </div>

          {/* Title - Playfair Display Dark Brown */}
          <h1 className="font-playfair text-[28px] md:text-[40px] font-bold text-[#3B2C23] tracking-wide leading-tight mb-2">
            My Profile
          </h1>

          {/* Subtitle - Muted Inter */}
          <p className="font-inter text-[#7A6A5C] text-[14px] md:text-[17px] font-normal tracking-wide leading-relaxed max-w-xl">
            Manage your orders, preferences, and personal details.
          </p>

          {/* Minimal Accent Underline */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 40, opacity: 0.9 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="h-[2px] bg-[#C46C3B] mt-3 rounded-full"
          />
        </motion.div>
      </section>

      {/* ─────────────────────────────────────────────
          📦 MAIN CONTENT GRID
      ────────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Sidebar Navigation */}
          <div className="space-y-6">
            {/* Profile Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[14px] border border-[#EAD6C3] p-8 text-center shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
            >
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#D98A5F] to-[#B05A28] p-[3px] shadow-lg shadow-[#A4552A]/20">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center border-[3px] border-white overflow-hidden">
                  <User className="w-10 h-10 text-[#C47543]" />
                </div>
              </div>
              <h2 className="font-playfair text-xl font-bold text-[#3B2C23] mb-1">
                {user.name}
              </h2>
              <p className="font-inter text-sm text-[#7A6A5C] mb-6">
                {user.email}
              </p>

              <Link
                href="/editPage"
                className="w-full py-2.5 border border-[#EAD6C3] rounded-[8px] text-[#A4552A] font-inter text-xs font-bold uppercase tracking-widest hover:bg-[#FFF4E8] hover:border-[#A4552A]/40 transition-all flex items-center justify-center gap-2"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Profile
              </Link>
            </motion.div>

            {/* Navigation Menu */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[14px] border border-[#EAD6C3] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-1"
            >
              <SidebarLink
                href="/profile"
                icon={User}
                label="Personal Info"
                active
              />
              <SidebarLink href="/orders" icon={Package} label="My Orders" />
              <SidebarLink href="/wishlist" icon={Heart} label="Wishlist" />

              <div className="h-px bg-[#EAD6C3]/40 my-2 mx-4" />

              <button 
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[10px] text-[#B03B2A] hover:bg-[#FFF4E8] transition-colors group"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-inter text-sm font-medium">Sign Out</span>
              </button>
            </motion.div>
          </div>

          {/* RIGHT: Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Personal Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-playfair text-2xl font-bold text-[#3B2C23]">
                  Personal Information
                </h3>
              </div>

              <div className="bg-white rounded-[14px] border border-[#EAD6C3] p-6 md:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.03)] grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow icon={User} label="Full Name" value={user.name} />
                <InfoRow icon={Mail} label="Email Address" value={user.email} />
                <InfoRow icon={Phone} label="Phone Number" value={user.phone} />
                <InfoRow
                  icon={MapPin}
                  label="Shipping Address"
                  value={user.address}
                />
              </div>
            </motion.div>

            {/* 2. Recent Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-playfair text-2xl font-bold text-[#3B2C23]">
                  Recent Orders
                </h3>
                <Link
                  href="/orders"
                  className="text-[#A4552A] text-sm font-inter font-medium hover:underline decoration-[#A4552A]/30 underline-offset-4"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-4">
                {recentOrders.length === 0 ? (
                  <div className="bg-white rounded-[14px] border border-dashed border-[#EAD6C3] p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FFF8F0] flex items-center justify-center text-[#C19A5B]/50">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h4 className="font-playfair text-lg font-bold text-[#3B2C23]">No orders yet</h4>
                    <p className="text-sm text-[#7A6A5C] mt-1 mb-6">Your recent purchases will appear here.</p>
                    <Link 
                      href="/shop"
                      className="px-6 py-2 bg-[#A4552A] text-white rounded-full text-sm font-bold hover:bg-[#8B3F20] transition-colors inline-block"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/orders/${order.id}`}
                      className="group bg-white rounded-[14px] border border-[#EAD6C3] p-5 hover:border-[#C19A5B]/60 hover:shadow-[0_4px_16px_rgba(164,85,42,0.08)] transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        {/* Handcrafted Icon Box */}
                        <div className="w-12 h-12 bg-[#FDFBF7] rounded-[10px] border border-[#EAD6C3] flex items-center justify-center group-hover:bg-[#FFF4E8] transition-colors">
                          <Package
                            className="w-6 h-6 text-[#C19A5B]"
                            strokeWidth={1.5}
                          />
                        </div>
                        <div>
                          <p className="font-inter font-bold text-[#3B2C23] text-sm mb-0.5">
                            {order.id}
                          </p>
                          <div className="font-inter text-xs text-[#7A6A5C] flex items-center gap-2">
                            <span>{order.date}</span>
                            <span className="w-1 h-1 rounded-full bg-[#EAD6C3]" />
                            <span>{order.items} Items</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full sm:w-auto gap-6 pl-16 sm:pl-0">
                        <p className="font-inter font-bold text-[#A4552A] text-[15px]">
                          {formatPrice(order.total)}
                        </p>

                        <div
                          className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 border transition-colors",
                            order.status === "Shipped"
                              ? "bg-[#EBF7EF] text-[#2E7D4D] border-[#3FAF6C]/20"
                              : "bg-[#FFF4E8] text-[#B05A28] border-[#E8B35B]/30",
                          )}
                        >
                          {order.status === "Shipped" ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {order.status}
                        </div>

                        <ChevronRight className="w-4 h-4 text-[#EAD6C3] group-hover:text-[#A4552A] group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
