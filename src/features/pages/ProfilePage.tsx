"use client"

import { useState, useEffect } from "react"
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
import { PageHero } from "@/components/layout/PageHero"

export default function ProfilePage() {
  const router = useRouter()
  const { user: firebaseUser, signOut } = useAuth()
  const { profile: user, updateProfile } = useUserProfileStore()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!firebaseUser) {
      router.push("/login")
      return
    }
    // Sync Firebase auth data into the profile store
    const updates: Record<string, string> = {}
    if (firebaseUser.phoneNumber && user.phone !== firebaseUser.phoneNumber)
      updates.phone = firebaseUser.phoneNumber
    if (firebaseUser.email && user.email !== firebaseUser.email)
      updates.email = firebaseUser.email
    if (Object.keys(updates).length > 0) updateProfile(updates)
  }, [firebaseUser])

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
        "flex items-center gap-3 px-4 py-3.5 rounded-[10px] transition-all duration-200 group border",
        active
          ? "bg-[#C19A5B]/10 border-[#C19A5B]/30 shadow-sm"
          : "bg-white/40 border-[#C19A5B]/10 hover:bg-[#C19A5B]/5 hover:border-[#C19A5B]/20",
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center transition-colors border",
          active
            ? "bg-[#1A1512] border-[#C19A5B]/30 text-[#C19A5B]"
            : "bg-white border-[#C19A5B]/10 text-[#1A1512] group-hover:bg-[#1A1512] group-hover:text-[#C19A5B]",
        )}
      >
        <Icon className="w-4 h-4" />
      </div>
      <span
        className={cn(
          "font-sans text-sm font-medium transition-colors",
          active
            ? "text-[#1A1512] font-bold"
            : "text-[#1A1512]/80 group-hover:text-[#1A1512]",
        )}
      >
        {label}
      </span>
      <ChevronRight
        className={cn(
          "w-4 h-4 ml-auto transition-transform duration-200",
          active
            ? "text-[#C19A5B]"
            : "text-[#C19A5B]/40 group-hover:text-[#C19A5B] group-hover:translate-x-1",
        )}
      />
    </Link>
  )

  const InfoRow = ({ icon: Icon, label, value }: any) => (
    <div className="flex items-start gap-4 p-4 rounded-[12px] bg-white/60 border border-[#C19A5B]/20 hover:border-[#C19A5B]/40 transition-colors">
      <div className="w-10 h-10 rounded-full bg-[#1A1512] flex items-center justify-center shrink-0 border border-[#C19A5B]/20 text-[#C19A5B]">
        <Icon className="w-5 h-5" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-[11px] font-sans font-bold text-[#1A1512]/60 uppercase tracking-wide mb-1">
          {label}
        </p>
        <p className="font-sans font-semibold text-[#1A1512] text-sm leading-snug">
          {value}
        </p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background kalamkari-static-background silk-fabric-texture text-[#1A1512]">
      {/* ─────────────────────────────────────────────
          🌅 HERO SECTION (Unified Signature Luxury PageHero)
      ────────────────────────────────────────────── */}
      <PageHero
        eyebrow="Customer Dashboard"
        titleStart="My"
        titleAccent="profile"
        description="Manage your orders, preferences, and personal details."
      />

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
              className="bg-white/80 backdrop-blur-sm rounded-[14px] border border-[#C19A5B]/30 p-8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
            >
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#1A1512] to-[#C19A5B] p-[3px] shadow-lg shadow-[#1A1512]/10">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center border-[3px] border-white overflow-hidden">
                  <User className="w-10 h-10 text-[#C19A5B]" />
                </div>
              </div>
              <h2 className="font-serif text-xl font-bold text-[#1A1512] mb-1">
                {user.name}
              </h2>
              <p className="font-sans text-sm text-[#1A1512]/60 mb-6">
                {user.email}
              </p>

              <Link
                href="/editPage"
                className="w-full py-2.5 border border-[#C19A5B]/40 rounded-[8px] text-[#1A1512] font-sans text-xs font-bold uppercase tracking-widest hover:bg-[#1A1512] hover:text-[#C19A5B] hover:border-transparent transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Profile
              </Link>
            </motion.div>

            {/* Navigation Menu */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-[14px] border border-[#C19A5B]/30 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-1"
            >
              <SidebarLink
                href="/profile"
                icon={User}
                label="Personal Info"
                active
              />
              <SidebarLink href="/orders" icon={Package} label="My Orders" />
              <SidebarLink href="/wishlist" icon={Heart} label="Wishlist" />

              <div className="h-px bg-[#C19A5B]/20 my-2 mx-4" />

              <button 
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[10px] text-red-700 hover:bg-red-500/10 hover:text-red-700 transition-colors group"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-sans text-sm font-medium">Sign Out</span>
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
                <h3 className="font-serif text-2xl font-bold text-[#1A1512]">
                  Personal Information
                </h3>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-[14px] border border-[#C19A5B]/30 p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <h3 className="font-serif text-2xl font-bold text-[#1A1512]">
                  Recent Orders
                </h3>
                <Link
                  href="/orders"
                  className="text-[#C19A5B] text-sm font-sans font-medium hover:text-[#1A1512] transition-colors hover:underline decoration-[#C19A5B]/30 underline-offset-4"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-4">
                {recentOrders.length === 0 ? (
                  <div className="bg-white/80 backdrop-blur-sm rounded-[14px] border border-dashed border-[#C19A5B]/40 p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1A1512]/5 flex items-center justify-center text-[#C19A5B]/50">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h4 className="font-serif text-lg font-bold text-[#1A1512]">No orders yet</h4>
                    <p className="text-sm text-[#1A1512]/60 mt-1 mb-6">Your recent purchases will appear here.</p>
                    <Link 
                      href="/shop"
                      className="px-6 py-2 bg-[#1A1512] text-white rounded-full text-sm font-bold hover:bg-[#C19A5B] transition-colors inline-block"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/orders/${order.id}`}
                      className="group bg-white/80 backdrop-blur-sm rounded-[14px] border border-[#C19A5B]/30 p-5 hover:border-[#C19A5B]/60 hover:shadow-[0_4px_20px_rgba(193,154,91,0.08)] transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        {/* Handcrafted Icon Box */}
                        <div className="w-12 h-12 bg-white rounded-[10px] border border-[#C19A5B]/20 flex items-center justify-center group-hover:bg-[#1A1512] transition-colors">
                          <Package
                            className="w-6 h-6 text-[#C19A5B]"
                            strokeWidth={1.5}
                          />
                        </div>
                        <div>
                          <p className="font-sans font-bold text-[#1A1512] text-sm mb-0.5">
                            {order.id}
                          </p>
                          <div className="font-sans text-xs text-[#1A1512]/60 flex items-center gap-2">
                            <span>{order.date}</span>
                            <span className="w-1 h-1 rounded-full bg-[#C19A5B]/30" />
                            <span>{order.items} Items</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full sm:w-auto gap-6 pl-16 sm:pl-0">
                        <p className="font-sans font-bold text-[#1A1512] text-[15px]">
                          {formatPrice(order.total)}
                        </p>

                        <div
                          className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 border transition-colors",
                            order.status === "Shipped"
                              ? "bg-green-500/10 text-green-700 border-green-500/20"
                              : "bg-[#C19A5B]/10 text-[#C19A5B] border-[#C19A5B]/20",
                          )}
                        >
                          {order.status === "Shipped" ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {order.status}
                        </div>

                        <ChevronRight className="w-4 h-4 text-[#C19A5B]/40 group-hover:text-[#1A1512] group-hover:translate-x-1 transition-all" />
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
