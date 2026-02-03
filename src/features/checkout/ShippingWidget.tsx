"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import {
  Truck,
  Clock,
  ShieldCheck,
  Gift,
  ChevronRight,
  Phone,
} from "lucide-react"
import { cn, formatPrice } from "@/shared/utils"

interface ShippingWidgetProps {
  subtotal: number
}

export const ShippingWidget = ({ subtotal }: ShippingWidgetProps) => {
  const FREE_SHIPPING_THRESHOLD = 5000

  // Calculate Progress Percentage
  const progress = useMemo(() => {
    const percent = (subtotal / FREE_SHIPPING_THRESHOLD) * 100
    return Math.min(percent, 100)
  }, [subtotal])

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const isUnlocked = remaining === 0

  return (
    <div className="w-full bg-white rounded-[14px] border border-[#EAD6C3] shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden mt-6">
      {/* 1️⃣ Header & Free Shipping Logic */}
      <div className="p-5 border-b border-[#EAD6C3]/60 bg-[#FFF8F0]/30">
        <h3 className="font-playfair font-bold text-[#3B2C23] text-lg mb-1 flex items-center gap-2">
          <Truck className="w-5 h-5 text-[#A4552A]" />
          Shipping & Delivery
        </h3>

        {/* Progress Bar Container */}
        <div className="mt-4">
          <div className="flex justify-between items-end mb-2">
            <p className="font-inter text-sm text-[#3B2C23]/80">
              {isUnlocked ? (
                <span className="font-bold text-[#2E7D4D] flex items-center gap-1">
                  🎉 You've unlocked FREE Shipping!
                </span>
              ) : (
                <>
                  Add{" "}
                  <span className="font-bold text-[#A4552A]">
                    {formatPrice(remaining)}
                  </span>{" "}
                  for{" "}
                  <span className="font-bold text-[#C19A5B]">
                    Free Shipping
                  </span>
                </>
              )}
            </p>
            <span className="font-inter text-xs font-bold text-[#C19A5B]">
              {Math.round(progress)}%
            </span>
          </div>

          <div className="h-2 w-full bg-[#EAD6C3]/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "circOut" }}
              className={cn(
                "h-full rounded-full transition-colors duration-300",
                isUnlocked
                  ? "bg-gradient-to-r from-[#3FAF6C] to-[#2E7D4D]"
                  : "bg-gradient-to-r from-[#C19A5B] to-[#A4552A]",
              )}
            />
          </div>
        </div>
      </div>

      {/* 2️⃣ Information Grid */}
      <div className="p-5 space-y-5">
        {/* Processing Time */}
        <div className="flex gap-3 group">
          <div className="w-8 h-8 rounded-full bg-[#FFF4E8] flex items-center justify-center shrink-0 border border-[#C19A5B]/20 group-hover:border-[#C19A5B] transition-colors">
            <Clock className="w-4 h-4 text-[#A4552A]" />
          </div>
          <div>
            <h4 className="font-inter font-bold text-[#3B2C23] text-sm">
              Artisanal Processing
            </h4>
            <p className="font-inter text-[#3B2C23]/60 text-xs mt-0.5 leading-relaxed">
              We hand-prepare every order. Please allow{" "}
              <span className="font-medium text-[#A4552A]">1–2 days</span> for
              crafting & packing.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#EAD6C3]/40 w-full" />

        {/* Delivery Options */}
        <div className="flex gap-3 group">
          <div className="w-8 h-8 rounded-full bg-[#FFF4E8] flex items-center justify-center shrink-0 border border-[#C19A5B]/20 group-hover:border-[#C19A5B] transition-colors">
            <Gift className="w-4 h-4 text-[#A4552A]" />
          </div>
          <div className="w-full">
            <h4 className="font-inter font-bold text-[#3B2C23] text-sm">
              Delivery Options
            </h4>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between items-center text-xs font-inter text-[#3B2C23]/70">
                <span>Standard (5–8 days)</span>
                <span className="font-medium">₹199</span>
              </div>
              <div className="flex justify-between items-center text-xs font-inter text-[#3B2C23]/70">
                <span>Express (2–4 days)</span>
                <span className="font-medium">₹399</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#EAD6C3]/40 w-full" />

        {/* Returns & Support */}
        <div className="flex gap-3 group">
          <div className="w-8 h-8 rounded-full bg-[#FFF4E8] flex items-center justify-center shrink-0 border border-[#C19A5B]/20 group-hover:border-[#C19A5B] transition-colors">
            <ShieldCheck className="w-4 h-4 text-[#A4552A]" />
          </div>
          <div className="w-full">
            <h4 className="font-inter font-bold text-[#3B2C23] text-sm">
              Peace of Mind
            </h4>
            <p className="font-inter text-[#3B2C23]/60 text-xs mt-0.5 mb-2">
              Secure checkout & hassle-free returns.
            </p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-[11px] font-bold uppercase text-[#C19A5B] cursor-pointer hover:text-[#A4552A] transition-colors">
                Return Policy <ChevronRight className="w-3 h-3" />
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold uppercase text-[#C19A5B] cursor-pointer hover:text-[#A4552A] transition-colors">
                Support <Phone className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
