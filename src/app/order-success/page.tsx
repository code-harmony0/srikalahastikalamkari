"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { CheckCircle2, Package, ArrowRight } from "lucide-react"
import { Button } from "@/shared/ui/button"

export default function OrderSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Auto-redirect to orders page after 3 seconds
    const timer = setTimeout(() => {
      router.push("/orders")
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-background kalamkari-static-background silk-fabric-texture text-[#1A1512] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-[#C19A5B]/20 shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-[#1A1512] rounded-full mb-6 border border-[#C19A5B]/30 shadow-lg shadow-[#1A1512]/10"
        >
          <CheckCircle2 className="w-10 h-10 text-[hsl(var(--brand-gold-deep))]" />
        </motion.div>

        {/* Title */}
        <h1 className="font-playfair text-3xl font-bold text-[#1A1512] mb-3">
          Order Placed Successfully!
        </h1>

        {/* Description */}
        <p className="text-[#1A1512]/70 font-inter mb-8 leading-relaxed text-sm">
          Thank you for your order. We've sent a confirmation email with your order details.
          You'll be redirected to your orders page shortly.
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <Link href="/orders" className="block">
            <Button className="w-full bg-[#1A1512] hover:bg-[#C19A5B] text-white py-3 rounded-lg font-inter font-medium transition-colors">
              <Package className="w-4 h-4 mr-2" />
              View My Orders
            </Button>
          </Link>

          <Link href="/products" className="block">
            <Button
              variant="outline"
              className="w-full border border-[#C19A5B]/30 hover:border-[#1A1512] hover:bg-[#1A1512] hover:text-[#C19A5B] text-[#1A1512] bg-white/60 py-3 rounded-lg font-inter font-medium transition-all"
            >
              Continue Shopping
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Auto-redirect notice */}
        <p className="text-xs text-[#1A1512]/50 font-inter mt-6">
          Redirecting to your orders in 3 seconds...
        </p>
      </motion.div>
    </div>
  )
}
