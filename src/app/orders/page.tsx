"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
  Star,
} from "lucide-react"
import { ReviewSubmissionDialog } from "@/features/orders/ReviewSubmissionDialog"
import { OptimizedImage } from "@/components/shared/OptimizedImage"
import { getImageTier } from "@/lib/image-tiers"
import { cn, formatPrice } from "@/shared/utils"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/shared/ui/use-toast"
import { useAuth } from "@/shared/contexts/AuthContext"
import { 
  calculateEstimatedDelivery, 
  getTrackingUrl, 
  getDeliveryMessage,
  DELIVERY_CONFIG 
} from "@/shared/config/delivery"
import { getUserOrders } from "./actions"
import { PageHero } from "@/components/layout/PageHero"

interface Order {
  id: string
  created_at: string
  total_amount: number
  status: "pending" | "paid" | "in_packing" | "packed" | "shipped" | "cancelled"
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
  const router = useRouter()
  const { user: firebaseUser } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const { toast } = useToast()
  
  // Review Dialog State
  const [reviewDialog, setReviewDialog] = useState<{
    isOpen: boolean;
    productId: string;
    productName: string;
    productImage: string;
  }>({
    isOpen: false,
    productId: "",
    productName: "",
    productImage: "",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 10

  // Redirect to login if not authenticated
  useEffect(() => {
    if (firebaseUser === null) {
      router.push("/login")
    }
  }, [firebaseUser, router])

  useEffect(() => {
    fetchOrders()
  }, [currentPage, firebaseUser])

  const fetchOrders = async () => {
    if (!firebaseUser) {
      setOrders([])
      setTotalCount(0)
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1

      const { data, count, error } = await getUserOrders(
        firebaseUser.uid,
        firebaseUser.phoneNumber,
        from,
        to
      )

      if (error) throw new Error(error)

      setOrders(data as any || [])
      setTotalCount(count || 0)
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
        return { label: "Confirmed", color: "text-[hsl(var(--brand-midnight))]", bgColor: "bg-[hsl(var(--brand-indigo-tint))]", icon: CheckCircle2 }
      case "in_packing":
        return { label: "Packing", color: "text-purple-600", bgColor: "bg-purple-50", icon: Box }
      case "packed":
        return { label: "Ready", color: "text-orange-600", bgColor: "bg-orange-50", icon: PackageCheck }
      case "shipped":
        return { label: "Shipped", color: "text-green-700", bgColor: "bg-green-50", icon: Truck }
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
      <div className="min-h-screen bg-background kalamkari-static-background silk-fabric-texture text-[hsl(var(--brand-ink))] flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-[hsl(var(--brand-gold)/0.2)] shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--brand-ink))] mx-auto mb-4" />
          <p className="text-[hsl(var(--brand-ink-soft))] font-inter text-sm">Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background kalamkari-static-background silk-fabric-texture text-[hsl(var(--brand-ink))]">
      {/* Hero Section */}
      <PageHero
        eyebrow="Purchase History"
        titleStart="My"
        titleAccent="orders"
        description="Track your current and previous purchases."
      />

      {/* Orders Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[hsl(var(--brand-ink-soft))] hover:text-[hsl(var(--brand-ink))] transition-colors mb-6 font-inter text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-xl border border-[hsl(var(--brand-gold)/0.2)] shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <Package className="w-16 h-16 text-[hsl(var(--brand-ink))] mx-auto mb-4" />
            <h3 className="font-serif text-xl font-bold text-[hsl(var(--brand-ink))] mb-2 italic">
              No orders yet
            </h3>
            <p className="text-[hsl(var(--brand-ink-soft))] font-inter mb-6 text-sm">
              Start shopping to see your orders here
            </p>
            <Link
              href="/products"
              className="inline-block px-8 py-3 bg-[hsl(var(--brand-midnight))] text-white border border-transparent rounded-full font-bold text-[11px] uppercase tracking-widest hover:bg-[hsl(var(--brand-midnight-hover))] hover:text-white transition-all duration-300 shadow-sm"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
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
                  className="bg-white/80 backdrop-blur-sm rounded-lg border border-[hsl(var(--brand-gold)/0.2)] overflow-hidden hover:border-[hsl(var(--brand-gold))] hover:shadow-md transition-all"
                >
                  {/* Order List Item - Always Visible */}
                  <button
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    className="w-full p-4 flex items-center gap-4 text-left hover:bg-[hsl(var(--brand-paper)/0.8)] transition-colors"
                  >
                    {/* Product Images Preview */}
                    <div className="flex -space-x-2">
                      {order.order_items?.slice(0, 2).map((item, idx) => (
                        <div
                          key={item.id}
                          className="relative w-12 h-12 bg-[hsl(var(--brand-ink)/0.05)] rounded-lg border-2 border-white shadow-sm flex-shrink-0 overflow-hidden"
                        >
                          {item.products?.images?.[0] ? (
                            <OptimizedImage
                              src={getImageTier(item.products.images, "thumb", 0)}
                              alt={item.products.name || "Product"}
                              fill
                              className="object-cover"
                              imageType="thumbnail"
                              sizes="48px"
                              placeholder="empty"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-[hsl(var(--brand-ink))] absolute inset-0 m-auto" />
                          )}
                        </div>
                      ))}
                      {order.order_items && order.order_items.length > 2 && (
                        <div className="relative w-12 h-12 bg-[hsl(var(--brand-ink)/0.1)] rounded-lg border-2 border-white shadow-sm flex items-center justify-center">
                          <span className="text-xs font-semibold text-[hsl(var(--brand-ink-soft))]">
                            +{order.order_items.length - 2}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Order Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-inter font-semibold text-sm text-[hsl(var(--brand-ink))]">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </h3>
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border",
                          order.status === "paid" ? "text-[hsl(var(--brand-midnight))] bg-[hsl(var(--brand-indigo-tint))] border-[hsl(var(--brand-midnight)/0.2)]" :
                          order.status === "in_packing" ? "text-purple-700 bg-purple-50/70 border-purple-200/50" :
                          order.status === "packed" ? "text-[hsl(var(--brand-ink))] bg-[hsl(var(--brand-gold)/0.15)] border-[hsl(var(--brand-gold)/0.2)]" :
                          order.status === "shipped" ? "text-emerald-700 bg-emerald-50/70 border-emerald-200/50" :
                          order.status === "cancelled" ? "text-red-700 bg-red-50/70 border-red-200/50" :
                          "text-stone-600 bg-stone-50 border-stone-200/50"
                        )}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[hsl(var(--brand-ink-soft))] font-inter">
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
                        <span className="font-semibold text-[hsl(var(--brand-ink))]">
                          {formatPrice(order.total_amount)}
                        </span>
                      </div>
                    </div>

                    {/* Expand Icon */}
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-[hsl(var(--brand-ink-soft))]" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-[hsl(var(--brand-ink-soft))]" />
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
                        className="border-t border-[hsl(var(--brand-gold)/0.2)]"
                      >
                        <div className="p-4 space-y-5">
                          {/* Status Journey */}
                          <div>
                            <h4 className="text-xs font-semibold text-[hsl(var(--brand-ink))] font-inter uppercase tracking-wide mb-3">
                              Order Status
                            </h4>
                            <div className="flex items-center justify-between relative px-2">
                              {/* Progress Line */}
                              <div className="absolute top-4 left-4 right-4 h-0.5 bg-[hsl(var(--brand-ink)/0.1)]" style={{ zIndex: 0 }} />
                              <div 
                                className="absolute top-4 left-4 h-0.5 bg-[hsl(var(--brand-gold))] transition-all duration-500" 
                                style={{ 
                                  width: `${(journey.findIndex(s => s.active) / (journey.length - 1)) * 92}%`,
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
                                        ? "bg-[hsl(var(--brand-midnight))] border-[hsl(var(--brand-midnight))] text-white"
                                        : "bg-white border-[hsl(var(--brand-ink)/0.1)] text-[hsl(var(--brand-ink)/0.3)]"
                                    )}>
                                      <StepIcon className="w-4 h-4" />
                                    </div>
                                    <span className={cn(
                                      "text-[10px] font-inter mt-1.5 text-center",
                                      step.completed || step.active ? "text-[hsl(var(--brand-ink))] font-semibold" : "text-[hsl(var(--brand-muted))]"
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
                            <h4 className="text-xs font-semibold text-[hsl(var(--brand-ink))] font-inter uppercase tracking-wide mb-3">
                              Items
                            </h4>
                            <div className="space-y-2">
                              {order.order_items?.map((item) => (
                                <div key={item.id} className="flex gap-3 p-2 rounded-lg hover:bg-[hsl(var(--brand-paper)/0.8)]">
                                  <div className="relative w-14 h-14 bg-[hsl(var(--brand-ink)/0.05)] rounded-lg border border-[hsl(var(--brand-gold)/0.2)] flex-shrink-0 overflow-hidden">
                                    {item.products?.images?.[0] ? (
                                      <OptimizedImage
                                        src={getImageTier(item.products.images, "thumb", 0)}
                                        alt={item.products.name || "Product"}
                                        fill
                                        className="object-cover"
                                        imageType="thumbnail"
                                        sizes="56px"
                                        placeholder="empty"
                                      />
                                    ) : (
                                      <Package className="w-5 h-5 text-[hsl(var(--brand-ink))] absolute inset-0 m-auto" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-inter text-sm font-medium text-[hsl(var(--brand-ink))] line-clamp-1">
                                      {item.products?.name || "Product"}
                                    </h5>
                                    <p className="text-xs text-[hsl(var(--brand-ink-soft))] font-inter">
                                      Qty: {item.quantity} × {formatPrice(item.price_at_purchase)}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-inter text-sm font-semibold text-[hsl(var(--brand-ink))]">
                                      {formatPrice(item.price_at_purchase * item.quantity)}
                                    </p>
                                    {(order.status === 'shipped' || order.status === 'paid') && (
                                      <button
                                        onClick={() => setReviewDialog({
                                          isOpen: true,
                                          productId: item.products?.id || "",
                                          productName: item.products?.name || "",
                                          productImage:
                                            getImageTier(item.products?.images, "thumb", 0) || "",
                                        })}
                                        className="mt-2 text-xs font-medium text-[hsl(var(--brand-ink))] underline decoration-[hsl(var(--brand-gold))] decoration-2 underline-offset-4 hover:decoration-[hsl(var(--brand-ink))] flex items-center justify-end gap-1 transition-colors"
                                      >
                                        <Star className="w-3 h-3" />
                                        Write Review
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Shipping & Total */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[hsl(var(--brand-gold)/0.2)]">
                            {/* Shipping Address */}
                            <div>
                              <h4 className="text-xs font-semibold text-[hsl(var(--brand-ink))] font-inter uppercase tracking-wide mb-2 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                Delivery Address
                              </h4>
                              <div className="text-xs text-[hsl(var(--brand-ink-soft))] font-inter space-y-0.5 bg-[hsl(var(--brand-ink)/0.05)] p-3 rounded-lg border border-[hsl(var(--brand-gold)/0.1)]">
                                {shippingAddr.firstName && (
                                  <p className="font-medium text-[hsl(var(--brand-ink))]">
                                    {shippingAddr.firstName} {shippingAddr.lastName}
                                  </p>
                                )}
                                {shippingAddr.address && <p>{shippingAddr.address}</p>}
                                {shippingAddr.city && (
                                  <p>{shippingAddr.city}, {shippingAddr.state} {shippingAddr.pincode}</p>
                                )}
                                {shippingAddr.phone && (
                                  <p className="flex items-center gap-1 mt-1.5 pt-1.5 border-t border-[hsl(var(--brand-gold)/0.1)]">
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
                              <h4 className="text-xs font-semibold text-[hsl(var(--brand-ink))] font-inter uppercase tracking-wide mb-2">
                                Order Summary
                              </h4>
                              <div className="bg-[hsl(var(--brand-ink)/0.05)] p-3 rounded-lg border border-[hsl(var(--brand-gold)/0.1)] space-y-2">
                                <div className="flex justify-between text-xs font-inter">
                                  <span className="text-[hsl(var(--brand-ink-soft))]">Subtotal</span>
                                  <span className="text-[hsl(var(--brand-ink))] font-medium">{formatPrice(order.order_items.reduce((sum, item) => sum + item.price_at_purchase * item.quantity, 0))}</span>
                                </div>
                                <div className="flex justify-between text-xs font-inter">
                                  <span className="text-[hsl(var(--brand-ink-soft))]">Shipping</span>
                                  <span className="text-emerald-700 font-medium">Free</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-[hsl(var(--brand-gold)/0.1)]">
                                  <span className="text-sm font-semibold text-[hsl(var(--brand-ink))] font-inter">Total</span>
                                  <span className="text-lg font-semibold tabular-nums text-[hsl(var(--brand-ink))] font-inter">
                                    {formatPrice(order.total_amount)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Delivery Information */}
                          <div className="pt-3 border-t border-[hsl(var(--brand-gold)/0.2)]">
                            <h4 className="text-xs font-semibold text-[hsl(var(--brand-ink))] font-inter uppercase tracking-wide mb-3 flex items-center gap-1">
                              <Info className="w-3 h-3" />
                              Delivery Information
                            </h4>
                            
                            <div className="bg-[hsl(var(--brand-ink)/0.05)] p-3 rounded-lg border border-[hsl(var(--brand-gold)/0.1)] space-y-2">
                              {/* Estimated Delivery */}
                              {(order.status === 'paid' || order.status === 'in_packing' || order.status === 'packed') && (
                                <div className="flex items-center gap-2 text-xs font-inter">
                                  <Calendar className="w-3 h-3 text-[hsl(var(--brand-ink))]" />
                                  <span className="text-[hsl(var(--brand-ink-soft))]">Expected by:</span>
                                  <span className="font-medium text-[hsl(var(--brand-ink))]">
                                    {calculateEstimatedDelivery(new Date(order.created_at)).estimatedDate.toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </span>
                                </div>
                              )}
                              
                              {/* Delivery Message */}
                              <div className="text-xs text-[hsl(var(--brand-ink-soft))] font-inter">
                                {getDeliveryMessage(order.status, order.shipping_company, order.tracking_id)}
                              </div>
                              
                              {/* Tracking Link */}
                              {order.status === 'shipped' && order.shipping_company && order.tracking_id && (
                                (() => {
                                  const trackingUrl = getTrackingUrl(order.shipping_company, order.tracking_id);
                                  return trackingUrl ? (
                                    <div className="pt-2 border-t border-[hsl(var(--brand-gold)/0.1)]">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="text-xs text-[hsl(var(--brand-ink-soft))] font-inter">Tracking ID</p>
                                          <p className="text-xs font-mono font-medium text-[hsl(var(--brand-ink))]">{order.tracking_id}</p>
                                        </div>
                                        <a
                                          href={trackingUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 text-xs text-[hsl(var(--brand-ink))] underline decoration-[hsl(var(--brand-gold))] decoration-2 underline-offset-4 hover:decoration-[hsl(var(--brand-ink))] font-medium transition-colors"
                                        >
                                          Track Order
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                      </div>
                                    </div>
                                  ) : null;
                                })()
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

        {/* Pagination Footer */}
        {orders.length > 0 && totalCount > 0 && (
          <div className="mt-6 px-6 py-4 border border-[hsl(var(--brand-gold)/0.2)] bg-white/80 backdrop-blur-sm rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-[hsl(var(--brand-ink-soft))]">
              Showing <span className="font-semibold text-[hsl(var(--brand-ink))]">{Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)}-{Math.min(currentPage * itemsPerPage, totalCount)}</span> of <span className="font-semibold text-[hsl(var(--brand-ink))]">{totalCount}</span> orders
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
                className="h-8 px-4 text-xs font-medium rounded-lg border border-[hsl(var(--brand-gold)/0.2)] bg-white text-[hsl(var(--brand-ink))] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[hsl(var(--brand-midnight))] hover:text-white hover:border-transparent transition-all"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, Math.ceil(totalCount / itemsPerPage)) }, (_, i) => {
                  const totalPages = Math.ceil(totalCount / itemsPerPage)
                  let pNum = i + 1
                  if (totalPages > 5) {
                    if (currentPage <= 3) {
                      pNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pNum = totalPages - 4 + i
                    } else {
                      pNum = currentPage - 2 + i
                    }
                  }
                  if (pNum > totalPages) return null
                  
                  return (
                    <button
                      key={pNum}
                      onClick={() => setCurrentPage(pNum)}
                      disabled={loading}
                      className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${
                        currentPage === pNum 
                          ? 'bg-[hsl(var(--brand-midnight))] text-white border border-transparent' 
                          : 'text-[hsl(var(--brand-ink-soft))] hover:bg-[hsl(var(--brand-ink)/0.1)] hover:text-[hsl(var(--brand-ink))]'
                      }`}
                    >
                      {pNum}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalCount / itemsPerPage), p + 1))}
                disabled={currentPage >= Math.ceil(totalCount / itemsPerPage) || loading}
                className="h-8 px-4 text-xs font-medium rounded-lg border border-[hsl(var(--brand-gold)/0.2)] bg-white text-[hsl(var(--brand-ink))] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[hsl(var(--brand-midnight))] hover:text-white hover:border-transparent transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <ReviewSubmissionDialog
        isOpen={reviewDialog.isOpen}
        onClose={() => setReviewDialog(prev => ({ ...prev, isOpen: false }))}
        productId={reviewDialog.productId}
        productName={reviewDialog.productName}
        productImage={reviewDialog.productImage}
      />
    </div>
  )
}
