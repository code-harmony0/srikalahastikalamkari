"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  Package,
  ArrowLeft,
  Loader2,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  PackageCheck,
  Box,
  MapPin,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Calendar,
  Info,
} from "lucide-react"
import { cn, formatPrice } from "@/shared/utils"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/shared/ui/use-toast"
import { 
  calculateEstimatedDelivery, 
  getTrackingUrl, 
  getDeliveryMessage,
  DELIVERY_CONFIG 
} from "@/shared/config/delivery"

interface Order {
  id: string
  created_at: string
  total_amount: number
  status: "pending" | "paid" | "in_packing" | "packed" | "shipped" | "delivered" | "cancelled"
  shipping_address: any
  customer_email: string
  shipping_company?: string
  tracking_id?: string
  shipped_at?: string
  delivered_at?: string
  order_items: {
    id: string
    quantity: number
    price_at_purchase: number
    products: {
      id: string
      name: string
      images: string[]
    } | null
  }[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          created_at,
          total_amount,
          status,
          shipping_address,
          customer_email,
          shipping_company,
          tracking_id,
          shipped_at,
          delivered_at,
          order_items (
            id,
            quantity,
            price_at_purchase,
            products (
              id,
              name,
              images
            )
          )
        `)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) throw error

      setOrders(data as any || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "paid":
        return { label: "Confirmed", color: "text-blue-600", bgColor: "bg-blue-50", icon: CheckCircle2 }
      case "in_packing":
        return { label: "Packing", color: "text-purple-600", bgColor: "bg-purple-50", icon: Box }
      case "packed":
        return { label: "Ready", color: "text-orange-600", bgColor: "bg-orange-50", icon: PackageCheck }
      case "shipped":
        return { label: "In Transit", color: "text-indigo-600", bgColor: "bg-indigo-50", icon: Truck }
      case "delivered":
        return { label: "Delivered", color: "text-green-600", bgColor: "bg-green-50", icon: CheckCircle2 }
      case "cancelled":
        return { label: "Cancelled", color: "text-red-600", bgColor: "bg-red-50", icon: XCircle }
      default:
        return { label: "Pending", color: "text-gray-600", bgColor: "bg-gray-50", icon: Clock }
    }
  }

  const getStatusJourney = (currentStatus: string) => {
    const allStatuses = [
      { key: "paid", label: "Confirmed", icon: CheckCircle2 },
      { key: "in_packing", label: "Packing", icon: Box },
      { key: "packed", label: "Ready", icon: PackageCheck },
      { key: "shipped", label: "Shipped", icon: Truck },
      { key: "delivered", label: "Delivered", icon: CheckCircle2 },
    ]

    if (currentStatus === "cancelled") {
      return [
        { key: "paid", label: "Confirmed", icon: CheckCircle2, active: true, completed: true },
        { key: "cancelled", label: "Cancelled", icon: XCircle, active: true, completed: true },
      ]
    }

    const currentIndex = allStatuses.findIndex(s => s.key === currentStatus)
    
    return allStatuses.map((status, index) => ({
      ...status,
      active: index === currentIndex,
      completed: index < currentIndex,
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#A4552A] mx-auto mb-4" />
          <p className="text-[#3B2C23]/60 font-inter text-sm">Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* Hero Section */}
      <section className="relative w-full flex flex-col items-center justify-center text-center px-6 overflow-hidden h-[160px] md:h-[200px] bg-[#FAF3EC] border-b border-[#EAD6C3]/60">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[#E8C3A2]/10 to-transparent pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center max-w-2xl mx-auto"
        >
          <div className="mb-3">
            <Package className="w-7 h-7 md:w-8 md:h-8 text-[#B35E2E]" strokeWidth={1.5} />
          </div>

          <h1 className="font-playfair text-[26px] md:text-[36px] font-bold text-[#3B2C23] tracking-wide leading-tight mb-2">
            My Orders
          </h1>

          <p className="font-inter text-[#7A6A5C] text-[13px] md:text-[15px] font-normal tracking-wide leading-relaxed">
            Track your current and previous purchases
          </p>
        </motion.div>
      </section>

      {/* Orders Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#7A6A5C] hover:text-[#A4552A] transition-colors mb-6 font-inter text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-[#EAD6C3]/30">
            <Package className="w-16 h-16 text-[#C19A5B] mx-auto mb-4" />
            <h3 className="font-playfair text-xl font-bold text-[#3B2C23] mb-2">
              No orders yet
            </h3>
            <p className="text-[#7A6A5C] font-inter mb-6 text-sm">
              Start shopping to see your orders here
            </p>
            <Link
              href="/products"
              className="inline-block px-6 py-2.5 bg-[#A4552A] text-white rounded-lg font-inter font-medium text-sm hover:bg-[#8B3F20] transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.status)
              const StatusIcon = statusConfig.icon
              const isExpanded = expandedOrder === order.id
              const shippingAddr = order.shipping_address || {}
              const journey = getStatusJourney(order.status)

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg border border-[#EAD6C3]/30 overflow-hidden hover:border-[#C19A5B] transition-all"
                >
                  {/* Order List Item - Always Visible */}
                  <button
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    className="w-full p-4 flex items-center gap-4 text-left hover:bg-[#FFF8F0]/50 transition-colors"
                  >
                    {/* Product Images Preview */}
                    <div className="flex -space-x-2">
                      {order.order_items?.slice(0, 2).map((item, idx) => (
                        <div
                          key={item.id}
                          className="relative w-12 h-12 bg-[#FFF4E8] rounded-lg border-2 border-white shadow-sm flex-shrink-0 overflow-hidden"
                        >
                          {item.products?.images?.[0] ? (
                            <Image
                              src={item.products.images[0]}
                              alt={item.products.name || "Product"}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-[#C19A5B] absolute inset-0 m-auto" />
                          )}
                        </div>
                      ))}
                      {order.order_items && order.order_items.length > 2 && (
                        <div className="relative w-12 h-12 bg-[#EAD6C3]/30 rounded-lg border-2 border-white shadow-sm flex items-center justify-center">
                          <span className="text-xs font-semibold text-[#7A6A5C]">
                            +{order.order_items.length - 2}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Order Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-inter font-semibold text-sm text-[#3B2C23]">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </h3>
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                          statusConfig.bgColor,
                          statusConfig.color
                        )}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#7A6A5C] font-inter">
                        <span>
                          {new Date(order.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span>•</span>
                        <span>{order.order_items?.length || 0} items</span>
                        <span>•</span>
                        <span className="font-semibold text-[#A4552A]">
                          {formatPrice(order.total_amount * 100)}
                        </span>
                      </div>
                    </div>

                    {/* Expand Icon */}
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-[#7A6A5C]" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-[#7A6A5C]" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Details - Accordion */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-[#EAD6C3]/30"
                      >
                        <div className="p-4 space-y-5">
                          {/* Status Journey */}
                          <div>
                            <h4 className="text-xs font-semibold text-[#3B2C23] font-inter uppercase tracking-wide mb-3">
                              Order Status
                            </h4>
                            <div className="flex items-center justify-between relative">
                              {/* Progress Line */}
                              <div className="absolute top-4 left-0 right-0 h-0.5 bg-[#EAD6C3]" style={{ zIndex: 0 }} />
                              <div 
                                className="absolute top-4 left-0 h-0.5 bg-[#A4552A] transition-all duration-500" 
                                style={{ 
                                  width: `${(journey.findIndex(s => s.active) / (journey.length - 1)) * 100}%`,
                                  zIndex: 1 
                                }} 
                              />
                              
                              {/* Status Steps */}
                              {journey.map((step, idx) => {
                                const StepIcon = step.icon
                                return (
                                  <div key={step.key} className="flex flex-col items-center relative" style={{ zIndex: 2 }}>
                                    <div className={cn(
                                      "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                                      step.completed || step.active
                                        ? "bg-[#A4552A] border-[#A4552A] text-white"
                                        : "bg-white border-[#EAD6C3] text-[#C19A5B]"
                                    )}>
                                      <StepIcon className="w-4 h-4" />
                                    </div>
                                    <span className={cn(
                                      "text-[10px] font-inter mt-1.5 text-center",
                                      step.completed || step.active ? "text-[#3B2C23] font-medium" : "text-[#7A6A5C]"
                                    )}>
                                      {step.label}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                          {/* Order Items */}
                          <div>
                            <h4 className="text-xs font-semibold text-[#3B2C23] font-inter uppercase tracking-wide mb-3">
                              Items
                            </h4>
                            <div className="space-y-2">
                              {order.order_items?.map((item) => (
                                <div key={item.id} className="flex gap-3 p-2 rounded-lg hover:bg-[#FFF8F0]/50">
                                  <div className="relative w-14 h-14 bg-[#FFF4E8] rounded-lg border border-[#EAD6C3]/30 flex-shrink-0 overflow-hidden">
                                    {item.products?.images?.[0] ? (
                                      <Image
                                        src={item.products.images[0]}
                                        alt={item.products.name || "Product"}
                                        fill
                                        className="object-cover"
                                      />
                                    ) : (
                                      <Package className="w-5 h-5 text-[#C19A5B] absolute inset-0 m-auto" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-inter text-sm font-medium text-[#3B2C23] line-clamp-1">
                                      {item.products?.name || "Product"}
                                    </h5>
                                    <p className="text-xs text-[#7A6A5C] font-inter">
                                      Qty: {item.quantity} × {formatPrice(item.price_at_purchase * 100)}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-inter text-sm font-semibold text-[#A4552A]">
                                      {formatPrice(item.price_at_purchase * item.quantity * 100)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Shipping & Total */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#EAD6C3]/30">
                            {/* Shipping Address */}
                            <div>
                              <h4 className="text-xs font-semibold text-[#3B2C23] font-inter uppercase tracking-wide mb-2 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                Delivery Address
                              </h4>
                              <div className="text-xs text-[#7A6A5C] font-inter space-y-0.5 bg-[#FFF8F0]/50 p-3 rounded-lg">
                                {shippingAddr.firstName && (
                                  <p className="font-medium text-[#3B2C23]">
                                    {shippingAddr.firstName} {shippingAddr.lastName}
                                  </p>
                                )}
                                {shippingAddr.address && <p>{shippingAddr.address}</p>}
                                {shippingAddr.city && (
                                  <p>{shippingAddr.city}, {shippingAddr.state} {shippingAddr.pincode}</p>
                                )}
                                {shippingAddr.phone && (
                                  <p className="flex items-center gap-1 mt-1.5 pt-1.5 border-t border-[#EAD6C3]/30">
                                    <Phone className="w-3 h-3" />
                                    {shippingAddr.phone}
                                  </p>
                                )}
                                {order.customer_email && (
                                  <p className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {order.customer_email}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Order Summary */}
                            <div>
                              <h4 className="text-xs font-semibold text-[#3B2C23] font-inter uppercase tracking-wide mb-2">
                                Order Summary
                              </h4>
                              <div className="bg-[#FFF8F0]/50 p-3 rounded-lg space-y-2">
                                <div className="flex justify-between text-xs font-inter">
                                  <span className="text-[#7A6A5C]">Subtotal</span>
                                  <span className="text-[#3B2C23]">{formatPrice(order.total_amount * 100)}</span>
                                </div>
                                <div className="flex justify-between text-xs font-inter">
                                  <span className="text-[#7A6A5C]">Shipping</span>
                                  <span className="text-green-600 font-medium">Free</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-[#EAD6C3]/30">
                                  <span className="text-sm font-semibold text-[#3B2C23] font-inter">Total</span>
                                  <span className="text-lg font-bold text-[#A4552A] font-playfair">
                                    {formatPrice(order.total_amount * 100)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Delivery Information */}
                          <div className="pt-3 border-t border-[#EAD6C3]/30">
                            <h4 className="text-xs font-semibold text-[#3B2C23] font-inter uppercase tracking-wide mb-3 flex items-center gap-1">
                              <Info className="w-3 h-3" />
                              Delivery Information
                            </h4>
                            
                            <div className="bg-[#FFF8F0]/50 p-3 rounded-lg space-y-2">
                              {/* Estimated Delivery */}
                              {(order.status === 'paid' || order.status === 'in_packing' || order.status === 'packed') && (
                                <div className="flex items-center gap-2 text-xs font-inter">
                                  <Calendar className="w-3 h-3 text-[#A4552A]" />
                                  <span className="text-[#7A6A5C]">Expected by:</span>
                                  <span className="font-medium text-[#3B2C23]">
                                    {calculateEstimatedDelivery(new Date(order.created_at)).estimatedDate.toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </span>
                                </div>
                              )}
                              
                              {/* Delivery Message */}
                              <div className="text-xs text-[#7A6A5C] font-inter">
                                {getDeliveryMessage(order.status, order.shipping_company, order.tracking_id)}
                              </div>
                              
                              {/* Tracking Link */}
                              {order.status === 'shipped' && order.shipping_company && order.tracking_id && (
                                (() => {
                                  const trackingUrl = getTrackingUrl(order.shipping_company, order.tracking_id);
                                  return trackingUrl ? (
                                    <div className="pt-2 border-t border-[#EAD6C3]/30">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="text-xs text-[#7A6A5C] font-inter">Tracking ID</p>
                                          <p className="text-xs font-mono font-medium text-[#3B2C23]">{order.tracking_id}</p>
                                        </div>
                                        <a
                                          href={trackingUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 text-xs text-[#A4552A] hover:text-[#8B3F20] font-medium transition-colors"
                                        >
                                          Track Order
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                      </div>
                                    </div>
                                  ) : null;
                                })()
                              )}
                              
                              {/* Delivered Date */}
                              {order.status === 'delivered' && order.delivered_at && (
                                <div className="flex items-center gap-2 text-xs font-inter pt-2 border-t border-[#EAD6C3]/30">
                                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                                  <span className="text-[#7A6A5C]">Delivered on:</span>
                                  <span className="font-medium text-green-600">
                                    {new Date(order.delivered_at).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
