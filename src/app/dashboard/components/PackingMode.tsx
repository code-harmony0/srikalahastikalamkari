import React, { useState, useEffect, useRef } from "react"
import { supabase, supabaseAdmin } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Button } from "@/app/dashboard/ui/button"
import { Input } from "@/app/dashboard/ui/input"
import { Badge } from "@/shared/ui/badge"
import { Progress } from "@/shared/ui/progress"
import { toast } from "sonner"
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/dashboard/ui/select"
import Barcode from "react-barcode"
import QRCode from "qrcode"
import {
  createPackingSession,
  updatePackingScanProgress,
  completePackingSession,
  cancelPackingSession,
  getActivePackingSession,
  Order as BackendOrder,
} from "@/services/orders"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog"
import {
  Package,
  PackageCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  Loader2,
  ShoppingBag,
  Copy,
  QrCode,
  Scan,
  BarChart3,
  Timer,
  Target,
  Truck,
  Hash,
  RefreshCw,
  User,
} from "lucide-react"

interface OrderItem {
  id: string
  name?: string
  price_at_purchase: number
  quantity: number
  image?: string
  category?: string
  barcode?: string // Real product barcode
  products?: {
    id: string
    name: string
    images: string[]
  } | null
}

interface Order {
  id: string
  created_at: string
  customer_name: string
  customer_phone: string
  order_items: OrderItem[]
  total_amount: number
  status: string
}

interface PackingModeProps {
  order: BackendOrder | any // Accept either backend Order or database order
  onComplete: () => void
  onCancel: () => void
}

interface ScanStatus {
  [itemId: string]: number // itemId -> scanned count
}

interface PackingStats {
  totalItems: number
  scannedItems: number
  startTime: Date
  estimatedCompletion?: Date
  scanRate: number // items per minute
}

type ScanMode = "product" | "order_qr"

const PackingMode: React.FC<PackingModeProps> = ({
  order,
  onComplete,
  onCancel,
}) => {
  const barcodeInputRef = useRef<HTMLInputElement>(null)

  const [scannedItems, setScannedItems] = useState<ScanStatus>({})
  const [currentBarcode, setCurrentBarcode] = useState("")
  const [scanError, setScanError] = useState<string | null>(null)
  const [isCompleting, setIsCompleting] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [lastScannedItem, setLastScannedItem] = useState<string | null>(null)
  const [packingSessionId, setPackingSessionId] = useState<string | null>(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)

  // New enhanced features
  const [scanMode, setScanMode] = useState<ScanMode>("product")
  const [orderQrVerified, setOrderQrVerified] = useState(false)
  const [packingStats, setPackingStats] = useState<PackingStats | null>(null)
  const [shippingId, setShippingId] = useState<string>("")
  const [autoGenerateShipping, setAutoGenerateShipping] = useState(true)
  const [orderQrCode, setOrderQrCode] = useState<string>("")
  const [showStats, setShowStats] = useState(false)

  // Generate Order QR Code and Shipping ID
  useEffect(() => {
    const generateOrderQR = async () => {
      try {
        const orderData = {
          id: order.id,
          customer: "Guest", // Simplified since shipping_address is not available in Order type
          items: order.order_items.length,
          total: order.total_amount,
          timestamp: new Date().toISOString(),
        }
        const qrData = JSON.stringify(orderData)
        const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
          width: 200,
          margin: 2,
          color: { dark: "#000000", light: "#ffffff" },
        })
        setOrderQrCode(qrCodeDataUrl)
      } catch (error) {
        console.error("Error generating QR code:", error)
      }
    }

    const generateShippingId = () => {
      if (autoGenerateShipping) {
        const timestamp = Date.now().toString().slice(-6)
        const orderShort = order.id.slice(-4).toUpperCase()
        const generated = `PKG-${orderShort}-${timestamp}`
        setShippingId(generated)
      }
    }

    generateOrderQR()
    generateShippingId()
  }, [order.id, autoGenerateShipping])

  // Initialize packing statistics
  useEffect(() => {
    const totalItems = order.order_items.reduce(
      (sum: number, item: any) => sum + item.quantity,
      0,
    )
    setPackingStats({
      totalItems,
      scannedItems: 0,
      startTime: new Date(),
      scanRate: 0,
    })
  }, [order.order_items])

  // Update packing statistics
  useEffect(() => {
    if (packingStats) {
      const scannedCount = Object.values(scannedItems).reduce(
        (sum, count) => sum + count,
        0,
      )
      const elapsed =
        (new Date().getTime() - packingStats.startTime.getTime()) / 60000 // minutes
      const scanRate = elapsed > 0 ? scannedCount / elapsed : 0

      let estimatedCompletion: Date | undefined
      if (scanRate > 0 && scannedCount < packingStats.totalItems) {
        const remainingItems = packingStats.totalItems - scannedCount
        const remainingMinutes = remainingItems / scanRate
        estimatedCompletion = new Date(Date.now() + remainingMinutes * 60000)
      }

      setPackingStats((prev) =>
        prev
          ? {
              ...prev,
              scannedItems: scannedCount,
              scanRate,
              estimatedCompletion,
            }
          : null,
      )
    }
  }, [scannedItems, packingStats?.startTime, packingStats?.totalItems])
  // Initialize or resume packing session
  useEffect(() => {
    const initPackingSession = async () => {
      try {
        // FIRST: Always update order status to in_packing immediately
        console.log(
          `[PackingMode] Updating order #${order.id} status to in_packing...`,
        )
        const { error: statusError } = await supabaseAdmin
          .from("orders")
          .update({ status: "in_packing" } as any)
          .eq("id", order.id)

        if (statusError) {
          console.error(
            "[PackingMode] Error updating order status:",
            statusError,
          )
          toast.error("Failed to update order status. Please try again.")
        } else {
          console.log(
            `[PackingMode] Order #${order.id} status updated to in_packing successfully`,
          )
        }

        // THEN: Try to create/resume packing session (optional)
        const { data: existingSession } = await getActivePackingSession(
          order.id,
        )

        if (existingSession) {
          // Resume existing session
          setPackingSessionId(existingSession.id)
          setScannedItems(existingSession.scan_progress || {})
          toast.success("Resuming packing session", {
            description: "Continuing from your last session",
          })
        } else {
          // Create new session (if table exists)
          const adminEmail =
            process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",")[0] ||
            "admin@example.com"
          const { data: newSession, error } = await createPackingSession(
            order.id,
            adminEmail,
          )

          if (error) {
            console.warn(
              "Packing session not created (table may not exist):",
              error,
            )
            // This is OK - we can still pack without the table
          } else if (newSession) {
            setPackingSessionId(newSession.id)
          }
        }
      } catch (error) {
        console.error("Error initializing packing session:", error)
        // Don't block packing if session creation fails
      } finally {
        setIsLoadingSession(false)
      }
    }

    initPackingSession()
  }, [order.id])

  // Auto-focus barcode input on mount and after each scan
  useEffect(() => {
    barcodeInputRef.current?.focus()
  }, [scannedItems])

  // Calculate progress
  const totalItemsToScan = order.order_items.reduce(
    (sum: number, item: any) => sum + item.quantity,
    0,
  )
  const totalScanned = Object.values(scannedItems).reduce(
    (sum, count) => sum + count,
    0,
  )
  const progressPercentage = (totalScanned / totalItemsToScan) * 100
  const isAllScanned = totalScanned === totalItemsToScan

  // Get item barcode - enhanced with proper SKU generation
  const getItemBarcode = (item: OrderItem): string => {
    if (item.barcode) return item.barcode

    // Generate SKU-based barcode if no barcode exists
    const productName = item.products?.name || item.name || "PRODUCT"
    const cleanName = productName
      .replace(/[^A-Z0-9]/gi, "")
      .toUpperCase()
      .slice(0, 6)
    const productId = item.products?.id || item.id
    const cleanId = productId
      .replace(/[^0-9]/g, "")
      .slice(-6)
      .padStart(6, "0")

    return `${cleanName}${cleanId}`
  }

  // Generate Order QR verification data
  const getOrderQrData = (): string => {
    return JSON.stringify({
      id: order.id,
      customer: "Guest", // Simplified since shipping_address is not available in Order type
      items: order.order_items.length,
      total: order.total_amount,
      timestamp: new Date().toISOString(),
    })
  }

  // Handle Order QR verification
  const handleOrderQrScan = (scannedData: string) => {
    try {
      const scannedOrder = JSON.parse(scannedData)
      if (scannedOrder.id === order.id) {
        setOrderQrVerified(true)
        setScanMode("product")
        playSuccessSound()
        toast.success("✓ Order Verified!", {
          description: `Order #${order.id.slice(-8)} confirmed. Ready to scan products.`,
        })
      } else {
        setScanError(
          `Wrong order! Scanned order #${scannedOrder.id}, expected #${order.id}`,
        )
        playErrorSound()
        toast.error("❌ Wrong Order!", {
          description: "This QR code belongs to a different order",
        })
      }
    } catch (error) {
      setScanError("Invalid QR code format")
      playErrorSound()
      toast.error("❌ Invalid QR Code", {
        description: "Please scan a valid order QR code",
      })
    }
  }

  // Handle barcode scan/input - enhanced with dual mode support
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentBarcode.trim()) {
      return
    }

    const scannedBarcode = currentBarcode.trim()
    setScanError(null)
    setLastScannedItem(null)

    // Handle Order QR mode
    if (scanMode === "order_qr") {
      handleOrderQrScan(scannedBarcode)
      setCurrentBarcode("")
      return
    }

    // Handle Product barcode mode
    if (scanMode === "product") {
      // Find matching item in order
      const matchingItem = order.order_items.find(
        (item: any) => getItemBarcode(item) === scannedBarcode,
      )

      if (!matchingItem) {
        // Wrong barcode - not in this order
        setScanError(
          `Wrong item! Barcode "${scannedBarcode}" not found in this order`,
        )
        playErrorSound()

        toast.error("❌ Wrong Item!", {
          description: "This item is not in the current order",
        })

        setCurrentBarcode("")
        return
      }

      // Check current scan count
      const currentCount = scannedItems[matchingItem.id] || 0
      const requiredCount = matchingItem.quantity

      if (currentCount >= requiredCount) {
        // Already scanned all required items
        setScanError(
          `Already scanned all ${requiredCount} ${matchingItem.products?.name || "items"}`,
        )
        playWarningSound()

        toast.warning("⚠ Already Scanned", {
          description: `All ${requiredCount} items already scanned`,
        })

        setCurrentBarcode("")
        return
      }

      // Valid scan - increment count
      const newCount = currentCount + 1
      const updatedItems = {
        ...scannedItems,
        [matchingItem.id]: newCount,
      }
      setScannedItems(updatedItems)

      // Persist scan progress to database
      if (packingSessionId) {
        updatePackingScanProgress(packingSessionId, updatedItems).catch(
          (err) => {
            console.error("Failed to save scan progress:", err)
          },
        )
      }

      setLastScannedItem(matchingItem.id)
      playSuccessSound()

      toast.success("✓ Item Scanned", {
        description: `${matchingItem.products?.name || "Item"} (${newCount}/${requiredCount})`,
      })

      setCurrentBarcode("")

      // Auto-clear the highlight after 1.5 seconds
      setTimeout(() => {
        setLastScannedItem(null)
      }, 1500)
    }
  }

  // Sound feedback functions
  const playSuccessSound = () => {
    const audio = new Audio(
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCdt0PLTgjMGHHDP8OOKRAoYZbbr5qRRDwc3iv/zyn4yBSJsyO/Xa0EJE1yw6OStWhELRKDi8bllHAU+j9vyxnksBSh3xvDek0MoKWK58OWoVA8GN4z+88V5KwUdcMfx5I5DCRRfs+jnrmMZCziRzu3HdSoDIWfE84pvMgoUYbPo5ahSDQc3iP7zxHgsBCBpyPLTfTIFI2+/8d6KPwsSXbTm67BfGAo/lunwy3gnBSBpyPLTfTIFI2+/8d6KPwsSXbTm67BfGAo/lunwy3gnBSBpyPLTfTIFI2+/8d6KPwsSXbTm67BfGAo/lunwy3gnBSBpyPLTfTIFI2+/8d6KPwsSXbTm67BfGAo/lunwy3gnBSBpyPLTfTIFI2+/8d6KPwsSXbTm67BfGAo/lunwy3gnBSBpyPLTfTIFI2+/8d6KPwsSXbTm67BfGAo/lunwy3gnBSBpyPLTfTIFI2+/8d6KPwsSXbTm67BfGAo/lunwy3gnBSBpyPLTfTIFI2+/8d6KPwsSXbTm67BfGAo/lunwy3gnBSBpyPLTfTIFI2+/8d6KPwsSXbTm67BfGAo/lunwy3gnBSBpyPLTfTIFI2+/8d6KPwsSXbTm67BfGAo/lunw==",
    )
    audio.play().catch(() => {})
  }

  const playErrorSound = () => {
    const audio = new Audio(
      "data:audio/wav;base64,UklGRhIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YU4AAACB//9//wAAAIH//3//AAAA",
    )
    audio.play().catch(() => {})
  }

  const playWarningSound = () => {
    const audio = new Audio(
      "data:audio/wav;base64,UklGRhIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YU4AAACB//9//wAAAIH//3//AAAA",
    )
    audio.play().catch(() => {})
  }

  if (isLoadingSession) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[rgb(15, 23, 42)] mx-auto"></div>
          <p className="text-lg text-gray-600">
            Initializing packing session...
          </p>
        </div>
      </div>
    )
  }

  // Get scan status for an item
  const getItemScanStatus = (
    item: OrderItem,
  ): {
    scanned: number
    required: number
    isComplete: boolean
    isNext: boolean
  } => {
    const scanned = scannedItems[item.id] || 0
    const required = item.quantity
    const isComplete = scanned >= required

    // "Next" is the first incomplete item
    const firstIncomplete = order.order_items.find(
      (i: any) => (scannedItems[i.id] || 0) < i.quantity,
    )
    const isNext = !isComplete && firstIncomplete?.id === item.id

    return { scanned, required, isComplete, isNext }
  }

  // Handle complete packing - enhanced with shipping ID
  const handleCompletePacking = async () => {
    setIsCompleting(true)
    try {
      // ALWAYS update order status to packed (regardless of packing_sessions)
      const completedAt = new Date().toISOString()
      const updateData: any = {
        status: "packed",
        packed_at: completedAt,
      }

      // Add shipping ID if provided
      if (shippingId.trim()) {
        updateData.tracking_id = shippingId.trim()
        updateData.shipping_company = "Internal" // Mark as internally generated
      }

      const { error: statusError } = await supabaseAdmin
        .from("orders")
        .update(updateData)
        .eq("id", order.id)

      if (statusError) {
        throw statusError
      }

      // THEN try to complete packing session (optional)
      if (packingSessionId) {
        await completePackingSession(packingSessionId).catch((err) => {
          console.warn(
            "Failed to complete packing session (table may not exist):",
            err,
          )
          // This is OK - status is already updated
        })
      }

      toast.success("✓ Packing Complete!", {
        description: `Order #${order.id.slice(-8)} is ready for shipping${shippingId ? ` (ID: ${shippingId})` : ""}`,
      })

      setTimeout(() => {
        onComplete()
      }, 1000)
    } catch (error: any) {
      console.error("Error completing packing:", error)
      toast.error("Failed to complete packing", {
        description: error.message || "Please try again",
      })
    } finally {
      setIsCompleting(false)
    }
  }

  // Handle cancel packing
  const handleCancelPacking = async () => {
    if (packingSessionId) {
      await cancelPackingSession(packingSessionId).catch((err) => {
        console.error("Failed to cancel session:", err)
      })
    }
    onCancel()
  }

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-auto">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Clean Header with White/Black Theme */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4 sticky top-0 z-10 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 p-3 rounded-xl">
                <Package className="h-7 w-7 text-gray-700" />
              </div>
              <div>
                <div className="text-2xl font-bold tracking-tight text-slate-900">
                  Order #{order.id.slice(-8)}
                </div>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer • {order.order_items.length} items
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Stats Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStats(!showStats)}
                className="text-gray-600 hover:bg-gray-100 hover:text-slate-900"
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                Stats
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelPacking}
                className="text-gray-600 hover:bg-gray-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Scan Mode Tabs */}
          <div className="mb-4">
            <Tabs
              value={scanMode}
              onValueChange={(value) => setScanMode(value as ScanMode)}
              className="w-full"
            >
              <TabsList className="bg-gray-100 border border-gray-200 p-1 h-auto rounded-xl">
                <TabsTrigger
                  value="order_qr"
                  className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-gray-600 px-4 py-2 rounded-lg flex items-center gap-2"
                  disabled={orderQrVerified}
                >
                  <QrCode className="h-4 w-4" />
                  {orderQrVerified ? "Order Verified ✓" : "Verify Order QR"}
                </TabsTrigger>
                <TabsTrigger
                  value="product"
                  className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-gray-600 px-4 py-2 rounded-lg flex items-center gap-2"
                  disabled={!orderQrVerified && scanMode !== "product"}
                >
                  <Scan className="h-4 w-4" />
                  Scan Products
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Scanner Input */}
          <form onSubmit={handleBarcodeSubmit} className="mb-4">
            <div className="flex gap-3">
              <Input
                ref={barcodeInputRef}
                type="text"
                value={currentBarcode}
                onChange={(e) => setCurrentBarcode(e.target.value)}
                placeholder={
                  scanMode === "order_qr"
                    ? "📱 Scan Order QR Code..."
                    : "📷 Scan Product Barcode..."
                }
                className="text-xl font-mono h-14 bg-white text-slate-900 placeholder:text-gray-500 border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-0/10 rounded-xl"
                autoFocus
              />
              <Button
                type="submit"
                size="lg"
                className="h-14 px-8 bg-gray-900 hover:bg-gray-800 text-white border-0 rounded-xl shadow-lg"
              >
                {scanMode === "order_qr" ? (
                  <QrCode className="h-5 w-5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
              </Button>
            </div>

            {scanError && (
              <div className="mt-3 flex items-center gap-2 text-red-700 text-sm bg-red-50 border border-red-200 p-3 rounded-xl">
                <AlertCircle className="h-4 w-4" />
                {scanError}
              </div>
            )}
          </form>

          {/* Progress Bar */}
          {scanMode === "product" && (
            <div className="flex items-center gap-4">
              <Progress value={progressPercentage} className="h-3 flex-1" />
              <span className="text-sm font-semibold min-w-[140px] text-right text-gray-700">
                {totalScanned}/{totalItemsToScan} •{" "}
                {Math.round(progressPercentage)}%
              </span>
            </div>
          )}
        </div>

        {/* Stats Panel */}
        {showStats && packingStats && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-gray-700" />
              Packing Statistics
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-gray-700" />
                  <span className="text-sm font-medium text-gray-600">
                    Progress
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {Math.round(
                    (packingStats.scannedItems / packingStats.totalItems) * 100,
                  )}
                  %
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Timer className="h-4 w-4 text-gray-700" />
                  <span className="text-sm font-medium text-gray-600">
                    Scan Rate
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {packingStats.scanRate.toFixed(1)}/min
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-gray-700" />
                  <span className="text-sm font-medium text-gray-600">
                    Elapsed
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {Math.round(
                    (new Date().getTime() - packingStats.startTime.getTime()) /
                      60000,
                  )}
                  m
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-gray-700" />
                  <span className="text-sm font-medium text-gray-600">ETA</span>
                </div>
                <p className="text-lg font-bold text-slate-900">
                  {packingStats.estimatedCompletion
                    ? packingStats.estimatedCompletion.toLocaleTimeString(
                        "en-IN",
                        { hour: "2-digit", minute: "2-digit" },
                      )
                    : "--:--"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Order QR Code Display */}
        {scanMode === "order_qr" && !orderQrVerified && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-gray-700" />
                  Order Verification Required
                </h3>
                <p className="text-gray-600 mb-4">
                  Scan this QR code with your scanner to verify you're packing
                  the correct order.
                </p>
                <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <AlertCircle className="h-4 w-4" />
                  This step ensures order accuracy and prevents mix-ups.
                </div>
              </div>

              {orderQrCode && (
                <div className="bg-white p-4 rounded-xl border-2 border-slate-300 shadow-sm">
                  <img
                    src={orderQrCode}
                    alt="Order QR Code"
                    className="w-48 h-48"
                  />
                  <p className="text-center text-xs text-gray-600 mt-2 font-mono">
                    Order #{order.id.slice(-8)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Shipping ID Section */}
        {scanMode === "product" && isAllScanned && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Hash className="h-5 w-5 text-gray-700" />
              Shipping Package ID
            </h3>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <Input
                  value={shippingId}
                  onChange={(e) => setShippingId(e.target.value)}
                  placeholder="Enter or generate shipping ID..."
                  className="h-12 text-lg font-mono border-slate-300 focus:border-slate-900 focus:ring-0/10 rounded-xl"
                />
              </div>
              <Button
                onClick={() => {
                  const timestamp = Date.now().toString().slice(-6)
                  const orderShort = order.id.slice(-4).toUpperCase()
                  const generated = `PKG-${orderShort}-${timestamp}`
                  setShippingId(generated)
                }}
                variant="outline"
                className="h-12 border-slate-300 text-gray-700 hover:bg-gray-50 rounded-xl"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate
              </Button>
            </div>

            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
              💡 This ID will be used for tracking and shipping label
              generation.
            </div>
          </div>
        )}

        {/* Items Grid - Clean White/Black Theme */}
        {scanMode === "product" && (
          <div className="grid md:grid-cols-2 gap-4">
            {order.order_items.map((item: any) => {
              const status = getItemScanStatus(item)
              const isHighlighted = lastScannedItem === item.id
              const itemBarcode = getItemBarcode(item)

              return (
                <Card
                  key={item.id}
                  className={`transition-all duration-300 ${
                    status.isComplete
                      ? "border-green-500 bg-gradient-to-br from-green-50 to-green-100 shadow-md"
                      : status.isNext
                        ? "border-blue-500 border-l-4 bg-gradient-to-br from-blue-50 to-blue-100 shadow-xl ring-2 ring-blue-200"
                        : "border-gray-200 bg-white"
                  } ${isHighlighted ? "ring-4 ring-green-400 scale-[1.02] shadow-2xl" : ""}`}
                >
                  <CardContent className="p-5">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      {(item.products?.images?.[0] || item.image) && (
                        <div className="flex-shrink-0">
                          <img
                            src={
                              item.products?.images?.[0] ||
                              item.image ||
                              "/images/products/product-placeholder.png"
                            }
                            alt={item.products?.name || item.name || "Product"}
                            className="w-20 h-20 object-cover rounded-xl border-2 border-gray-200 shadow-sm"
                          />
                        </div>
                      )}

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-base line-clamp-1 text-slate-900">
                              {item.products?.name || item.name || "Product"}
                            </h4>
                            <div className="flex items-center gap-3 mt-1">
                              {item.category && (
                                <Badge
                                  variant="outline"
                                  className="text-xs border-slate-300 text-gray-600 bg-gray-50"
                                >
                                  {item.category}
                                </Badge>
                              )}
                              <span className="text-sm font-bold text-gray-700">
                                ₹
                                {item.price_at_purchase.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                          <Badge
                            className={`${
                              status.isComplete
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : status.isNext
                                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                                  : "bg-gray-500 hover:bg-gray-600 text-white"
                            } font-semibold`}
                          >
                            {status.scanned}/{status.required}
                          </Badge>
                        </div>

                        {/* Enhanced Barcode Display */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-600 font-medium">
                              Product Barcode:
                            </span>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-xs text-gray-700 hover:bg-gray-100"
                              onClick={() => {
                                navigator.clipboard.writeText(itemBarcode)
                                toast.success("Copied!", {
                                  description: `Barcode ${itemBarcode} copied to clipboard`,
                                })
                              }}
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </Button>
                          </div>
                          <div className="bg-white rounded-lg px-3 py-2 border border-gray-200 shadow-sm">
                            <Barcode
                              value={itemBarcode}
                              format="CODE128"
                              width={1.5}
                              height={40}
                              displayValue={true}
                              fontSize={11}
                              margin={0}
                              background="#ffffff"
                              lineColor="#000000"
                            />
                          </div>
                        </div>

                        {/* Enhanced Status Indicators */}
                        {status.isNext && (
                          <div className="mt-3 text-xs text-center text-blue-700 font-semibold bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center justify-center gap-2">
                            <Target className="h-3 w-3" />
                            SCAN NEXT ({status.required - status.scanned}{" "}
                            remaining)
                          </div>
                        )}
                        {status.isComplete && (
                          <div className="mt-3 text-xs text-center text-green-700 font-semibold bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center justify-center gap-2">
                            <CheckCircle2 className="h-3 w-3" />
                            COMPLETE ✓
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Enhanced Action Buttons */}
        <div className="flex gap-4 mt-6">
          <Button
            onClick={handleCompletePacking}
            disabled={!isAllScanned || isCompleting || scanMode !== "product"}
            size="lg"
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white h-14 text-lg font-semibold rounded-xl shadow-lg"
          >
            {isCompleting ? (
              <>
                <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                Completing Packing...
              </>
            ) : (
              <>
                <PackageCheck className="mr-3 h-6 w-6" />
                Complete Packing
                {shippingId && (
                  <span className="ml-2 text-sm opacity-80">
                    ({shippingId})
                  </span>
                )}
              </>
            )}
          </Button>
          <Button
            onClick={() => setShowCancelDialog(true)}
            variant="outline"
            size="lg"
            className="border-slate-300 text-gray-700 hover:bg-gray-50 h-14 px-8 rounded-xl"
          >
            Cancel
          </Button>
        </div>

        {/* Enhanced Cancel Confirmation Dialog */}
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent className="rounded-2xl border border-gray-200">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-slate-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-slate-600" />
                Cancel Packing Session?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                Your scanning progress will be saved, but you'll need to restart
                the packing process. Are you sure you want to exit?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-slate-300 text-gray-700 hover:bg-gray-50 rounded-xl">
                Continue Packing
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancelPacking}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
              >
                Yes, Exit Packing
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

export default PackingMode
