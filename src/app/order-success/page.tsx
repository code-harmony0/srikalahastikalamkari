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
    <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6"
        >
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </motion.div>

        {/* Title */}
        <h1 className="font-playfair text-3xl font-bold text-[#3B2C23] mb-3">
          Order Placed Successfully!
        </h1>

        {/* Description */}
        <p className="text-[#7A6A5C] font-inter mb-8 leading-relaxed">
          Thank you for your order. We've sent a confirmation email with your order details.
          You'll be redirected to your orders page shortly.
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <Link href="/orders" className="block">
            <Button className="w-full bg-[#A4552A] hover:bg-[#8B3F20] text-white py-3 rounded-lg font-inter font-medium">
              <Package className="w-4 h-4 mr-2" />
              View My Orders
            </Button>
          </Link>

          <Link href="/products" className="block">
            <Button
              variant="outline"
              className="w-full border-2 border-[#EAD6C3] hover:border-[#A4552A] hover:bg-[#FFF4E8] py-3 rounded-lg font-inter font-medium"
            >
              Continue Shopping
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Auto-redirect notice */}
        <p className="text-xs text-[#7A6A5C] font-inter mt-6">
          Redirecting to your orders in 3 seconds...
        </p>
      </motion.div>
    </div>
  )
}
