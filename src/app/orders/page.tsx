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
    if (!firebaseUser?.phoneNumber) {
      setOrders([])
      setTotalCount(0)
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1

      const { data, error, count } = await supabase
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
        `, { count: 'exact' })
        .eq("customer_phone", firebaseUser.phoneNumber)
        .order("created_at", { ascending: false })
        .range(from, to)

      if (error) throw error

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
        return { label: "Confirmed", color: "text-blue-600", bgColor: "bg-blue-50", icon: CheckCircle2 }
      case "in_packing":
        return { label: "Packing", color: "text-purple-600", bgColor: "bg-purple-50", icon: Box }
      case "packed":
        return { label: "Ready", color: "text-orange-600", bgColor: "bg-orange-50", icon: PackageCheck }
      case "shipped":
        return { label: "Shipped", color: "text-green-600", bgColor: "bg-green-50", icon: Truck }
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
                          {formatPrice(order.total_amount)}
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
                                      <Package className="w-5 h-5 text-[#C19A5B] absolute inset-0 m-auto" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-inter text-sm font-medium text-[#3B2C23] line-clamp-1">
                                      {item.products?.name || "Product"}
                                    </h5>
                                    <p className="text-xs text-[#7A6A5C] font-inter">
                                      Qty: {item.quantity} × {formatPrice(item.price_at_purchase)}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-inter text-sm font-semibold text-[#A4552A]">
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
                                        className="mt-2 text-xs font-medium text-[#C19A5B] hover:text-[#A4552A] flex items-center justify-end gap-1 transition-colors"
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
                                  <span className="text-[#3B2C23]">{formatPrice(order.order_items.reduce((sum, item) => sum + item.price_at_purchase * item.quantity, 0))}</span>
                                </div>
                                <div className="flex justify-between text-xs font-inter">
                                  <span className="text-[#7A6A5C]">Shipping</span>
                                  <span className="text-green-600 font-medium">Free</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-[#EAD6C3]/30">
                                  <span className="text-sm font-semibold text-[#3B2C23] font-inter">Total</span>
                                  <span className="text-lg font-bold text-[#A4552A] font-playfair">
                                    {formatPrice(order.total_amount)}
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
          <div className="mt-6 px-6 py-4 border-t border-[#EAD6C3]/20 bg-white/50 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-[#7A6A5C]">
              Showing <span className="font-semibold text-[#A4552A]">{Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)}-{Math.min(currentPage * itemsPerPage, totalCount)}</span> of <span className="font-semibold text-[#3B2C23]">{totalCount}</span> orders
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
                className="h-8 px-4 text-xs font-medium rounded-lg border border-[#C19A5B]/20 bg-white text-[#3B2C23] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#FFF4E8] hover:border-[#C19A5B] transition-all"
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
                          ? 'bg-[#A4552A] text-white shadow-md shadow-[#A4552A]/20' 
                          : 'text-[#3B2C23]/60 hover:bg-[#FFF4E8] hover:text-[#A4552A]'
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
                className="h-8 px-4 text-xs font-medium rounded-lg border border-[#C19A5B]/20 bg-white text-[#3B2C23] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#FFF4E8] hover:border-[#C19A5B] transition-all"
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
