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
    <div className="w-full bg-[#FFF8F0] rounded-[14px] border border-[#C19A5B]/20 shadow-[0_2px_10px_rgba(26,21,18,0.03)] overflow-hidden mt-6">
      {/* 1️⃣ Header & Free Shipping Banner */}
      <div className="p-5 border-b border-[#C19A5B]/20 bg-[#C19A5B]/5">
        <h3 className="font-playfair font-bold text-[#1A1512] text-lg mb-1 flex items-center gap-2">
          <Truck className="w-5 h-5 text-[#C19A5B]" />
          Shipping & Delivery
        </h3>

        {/* Static Free Shipping Banner */}
        <div className="mt-4 bg-[#C19A5B]/10 p-3 rounded-lg border border-[#C19A5B]/20">
          <p className="font-inter text-sm text-[#1A1512] flex items-center gap-2">
            <Gift className="w-4 h-4 text-[#C19A5B]" />
            <span className="font-bold">Free Shipping</span> on all orders
          </p>
        </div>
      </div>

      {/* 2️⃣ Information Grid */}
      <div className="p-5 space-y-5">
        {/* Processing Time */}
        <div className="flex gap-3 group">
          <div className="w-8 h-8 rounded-full bg-[#C19A5B]/10 flex items-center justify-center shrink-0 border border-[#C19A5B]/20 group-hover:border-[#C19A5B] transition-colors">
            <Clock className="w-4 h-4 text-[#C19A5B]" />
          </div>
          <div>
            <h4 className="font-inter font-bold text-[#1A1512] text-sm">
              Artisanal Processing
            </h4>
            <p className="font-inter text-[#1A1512]/60 text-xs mt-0.5 leading-relaxed">
              We hand-prepare every order. Please allow{" "}
              <span className="font-medium text-[#C19A5B]">1–2 days</span> for
              crafting & packing.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#C19A5B]/10 w-full" />

        {/* Delivery Options */}
        <div className="flex gap-3 group">
          <div className="w-8 h-8 rounded-full bg-[#C19A5B]/10 flex items-center justify-center shrink-0 border border-[#C19A5B]/20 group-hover:border-[#C19A5B] transition-colors">
            <Gift className="w-4 h-4 text-[#C19A5B]" />
          </div>
          <div className="w-full">
            <h4 className="font-inter font-bold text-[#1A1512] text-sm">
              Delivery Options
            </h4>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between items-center text-xs font-inter text-[#1A1512]/70">
                <span>Fast Delivery (5–7 days)</span>
                <span className="font-medium text-green-600 font-semibold">Free</span>
              </div>
              <div className="flex justify-between items-center text-xs font-inter text-[#1A1512]/70">
                <span>Express (2–4 days)</span>
                <span className="font-medium text-[#1A1512]">₹399</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#C19A5B]/10 w-full" />

        {/* Support */}
        <div className="flex gap-3 group">
          <div className="w-8 h-8 rounded-full bg-[#C19A5B]/10 flex items-center justify-center shrink-0 border border-[#C19A5B]/20 group-hover:border-[#C19A5B] transition-colors">
            <ShieldCheck className="w-4 h-4 text-[#C19A5B]" />
          </div>
          <div className="w-full">
            <h4 className="font-inter font-bold text-[#1A1512] text-sm">
              Peace of Mind
            </h4>
            <p className="font-inter text-[#1A1512]/60 text-xs mt-0.5 mb-2">
              Secure checkout.
            </p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-[11px] font-bold uppercase text-[#C19A5B] cursor-pointer hover:text-[#1A1512] transition-colors">
                Support <Phone className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
