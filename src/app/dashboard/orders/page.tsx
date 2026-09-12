"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, supabaseAdmin } from "@/lib/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/app/dashboard/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { getImageTier } from "@/lib/image-tiers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/dashboard/ui/dialog";
import {
  RefreshCw,
  MapPin,
  Phone,
  User,
  Package,
  Filter,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  PackageCheck,
  MoreHorizontal,
  ArrowRight,
  AlertCircle,
  XCircle,
  Bike,
  Eye,
  X
} from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/shared/ui/separator";
import PackingMode from "@/app/dashboard/components/PackingMode";

import { shipOrder, getOrderStatistics, updateOrderStatus, cancelOrder } from "@/services/orders";
import { Label } from "@/app/dashboard/ui/label";
import { Input } from "@/app/dashboard/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/dashboard/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Textarea } from "@/app/dashboard/ui/textarea";

interface Order {
  id: string;
  created_at: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
  customer_address?: string;
  total_amount: number;
  status: "pending" | "paid" | "in_packing" | "packed" | "shipped" | "cancelled";
  shipping_address?: any;
  order_items?: {
    id: string;
    quantity: number;
    price_at_purchase: number;
    products: {
      id: string;
      name: string;
      images: string[] | null;
    } | null;
  }[];
  razorpay_payment_id?: string;
  shipping_company?: string;
  tracking_id?: string;
  packed_at?: string;
  shipped_at?: string;

}

const Orders = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter and search state
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;

  // Packing mode state
  const [packingOrder, setPackingOrder] = useState<Order | null>(null);

  // Shipping dialog state
  const [shippingOrder, setShippingOrder] = useState<Order | null>(null);
  const [shippingCompany, setShippingCompany] = useState("DTDC");
  const [trackingId, setTrackingId] = useState("");
  const [isShipping, setIsShipping] = useState(false);

  // Cancel dialog state
  const [cancelOrderData, setCancelOrderData] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  // Statistics
  const [stats, setStats] = useState<any>(null);

  const handleShipOrder = async () => {
    if (!shippingOrder) return;

    // Validation for non-manual shipping
    if (shippingCompany !== "Manual" && shippingCompany !== "InStore" && !trackingId) {
      toast.error("Tracking ID Required", {
        description: "Please enter a tracking ID for courier shipments."
      });
      return;
    }

    setIsShipping(true);

    // For manual/instore, we might not have a tracking ID, so we use a placeholder or empty
    const finalTrackingId = (shippingCompany === "Manual" || shippingCompany === "InStore")
      ? (trackingId || "MANUAL_DELIVERY")
      : trackingId;

    const { data, error } = await shipOrder(shippingOrder.id, {
      shipping_company: shippingCompany,
      tracking_id: finalTrackingId
    });

    setIsShipping(false);

    if (error) {
      toast.error("Failed to update shipping status");
    } else {
      toast.success("Order Shipped!", {
        description: `Order #${shippingOrder.id.slice(-8)} marked as shipped via ${shippingCompany}`
      });
      setShippingOrder(null);
      setTrackingId("");
      setShippingCompany("DTDC");
      fetchOrders();
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelOrderData || !cancelReason.trim()) {
      toast.error("Reason Required", {
        description: "Please enter a reason for cancellation."
      });
      return;
    }

    setIsCancelling(true);
    const { error } = await cancelOrder(cancelOrderData.id, cancelReason);
    setIsCancelling(false);

    if (error) {
      toast.error("Failed to cancel order");
    } else {
      toast.success("Order Cancelled", {
        description: `Order #${cancelOrderData.id.slice(-8)} has been cancelled.`
      });
      setCancelOrderData(null);
      setCancelReason("");
      fetchOrders();
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    const success = await updateOrderStatus(orderId, newStatus as any);
    if (!success) {
      toast.error("Failed to update status");
    } else {
      toast.success("Status Updated", {
        description: `Order #${orderId.slice(-8)} moved to ${newStatus.replace('_', ' ')}`
      });
      fetchOrders();
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, error, count } = await supabaseAdmin
        .from("orders")
        .select(`
          *,
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
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      setOrders((data as any) || []);
      setTotalCount(count || 0);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast.error("Error fetching orders", {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [page]);

  const fetchStats = async () => {
    const data = await getOrderStatistics();
    if (data) {
      setStats(data);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-slate-100 text-slate-700 border-slate-300";
      case "paid": return "bg-slate-100 text-slate-800 border-slate-300";
      case "in_packing": return "bg-slate-100 text-slate-800 border-slate-300";
      case "packed": return "bg-purple-100 text-purple-800 border-purple-200";
      case "shipped": return "bg-green-100 text-green-800 border-green-200";

      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
      case "paid": return <Clock className="h-3.5 w-3.5" />;
      case "in_packing": return <Package className="h-3.5 w-3.5" />;
      case "packed": return <PackageCheck className="h-3.5 w-3.5" />;
      case "shipped": return <Truck className="h-3.5 w-3.5" />;

      case "cancelled": return <XCircle className="h-3.5 w-3.5" />;
      default: return <Package className="h-3.5 w-3.5" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "in_packing": return "Processing";
      case "paid": return "Order Placed";
      default: return status.replace('_', ' ');
    }
  };

  // Filter and search logic
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    // Extract customer info from shipping_address or fallback fields
    const customerName = order.shipping_address?.firstName 
      ? `${order.shipping_address.firstName} ${order.shipping_address.lastName || ''}`.trim()
      : order.customer_name || order.customer_email || '';
    const customerPhone = order.shipping_address?.phone || order.customer_phone || '';
    
    const matchesSearch =
      searchQuery === "" ||
      order.id.toString().includes(searchQuery) ||
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerPhone.includes(searchQuery) ||
      order.tracking_id?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-6 font-sans space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Orders</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and track all customer orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchOrders}
            disabled={loading}
            variant="ghost"
            className="h-9 hover:bg-slate-200/50 border-0 text-slate-600"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Dashboard - Bento Style */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Orders</p>
              <p className="text-2xl font-bold text-slate-900">{Number(stats.total_orders) || 0}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Today's Orders</p>
              <p className="text-2xl font-bold text-slate-900">{Number(stats.todayCount) || 0}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <PackageCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">Pending Action</p>
              <p className="text-2xl font-bold text-slate-900">{(Number(stats.pending_orders) || 0) + (Number(stats.processing_orders) || 0)}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Today's Revenue</p>
              <p className="text-2xl font-bold text-slate-900">₹{(Number(stats.todayRevenue) || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto">
          <TabsList className="bg-slate-100/80 p-1 h-auto rounded-lg gap-1">
            {["all", "paid", "in_packing", "packed", "shipped", "cancelled"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:font-semibold px-4 py-2 text-sm text-slate-600 capitalize transition-all"
              >
                {tab === 'in_packing' ? 'Processing' : tab === 'paid' ? 'New' : tab.replace('_', ' ')}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, Name, Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 focus:bg-white text-sm transition-all"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50 border-b border-slate-100">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="w-[100px] font-semibold text-slate-700 pl-4 py-3">Customer</TableHead>
              <TableHead className="font-semibold text-slate-700 py-3">Date</TableHead>
              <TableHead className="font-semibold text-slate-700 py-3">Contact</TableHead>
              <TableHead className="font-semibold text-slate-700 py-3">Items</TableHead>
              <TableHead className="font-semibold text-slate-700 py-3 text-right">Amount</TableHead>
              <TableHead className="font-semibold text-slate-700 py-3">Status</TableHead>
              <TableHead className="text-right font-semibold text-slate-700 pr-6 py-3">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16 text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <Search className="h-8 w-8 text-slate-300" />
                    </div>
                    <p className="text-lg font-medium text-slate-900">No orders found</p>
                    <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or search query</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer hover:bg-slate-50/80 transition-colors group border-slate-50"
                  onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                >
                  <TableCell className="font-medium text-slate-900 pl-4 py-3">
                    <div className="font-semibold text-sm">
                      {order.shipping_address?.firstName 
                        ? `${order.shipping_address.firstName} ${order.shipping_address.lastName || ''}`.trim()
                        : order.customer_email || 'Guest'}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">#{order.id.slice(-8)}</div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500 py-3">
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="font-medium text-slate-900">
                      {order.shipping_address?.phone || order.customer_phone || '-'}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {order.shipping_address?.city || '-'}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2 overflow-hidden">
                      {order.order_items && order.order_items.slice(0, 3).map((item, i) => (
                          <div key={i} className="relative h-7 w-7 rounded-full ring-2 ring-white bg-slate-100 overflow-hidden border border-slate-300">
                            <OptimizedImage
                              className="object-cover"
                              src={getImageTier(item.products?.images, "thumb", 0)}
                              alt={item.products?.name || "Product"}
                              fill
                              imageType="thumbnail"
                              sizes="28px"
                              placeholder="empty"
                            />
                          </div>
                        ))}
                      </div>
                      {order.order_items && order.order_items.length > 3 && (
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">+{order.order_items.length - 3}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-right tabular-nums font-bold text-slate-900">
                    {formatCurrency(order.total_amount)}
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge variant="outline" className={`${getStatusColor(order.status)} border-0 px-3 py-1 flex items-center gap-1.5 w-fit rounded-full font-medium shadow-sm`}>
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{getStatusLabel(order.status)}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6 py-4">
                    {/* INLINE ACTIONS - VISIBLE ON HOVER */}
                    <div
                      className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0"
                      onClick={(e) => e.stopPropagation()} // Prevent row click
                    >
                      {/* ORDER PLACED (Paid) */}
                      {order.status === 'paid' && (
                        <>
                          <Button
                            size="sm"
                            className="h-8 bg-green-600 hover:bg-green-700 text-white shadow-sm"
                            onClick={() => setPackingOrder(order)}
                          >
                            Start Packing
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => setCancelOrderData(order)}
                          >
                            Cancel
                          </Button>
                        </>
                      )}

                      {/* PROCESSING (In Packing) */}
                      {order.status === 'in_packing' && (
                        <>
                          <Button
                            size="sm"
                            className="h-8 bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                            onClick={() => setPackingOrder(order)}
                          >
                            <Package className="mr-1.5 h-3.5 w-3.5" />
                            Resume Packing
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => setCancelOrderData(order)}
                          >
                            Cancel
                          </Button>
                        </>
                      )}

                      {/* PACKED */}
                      {order.status === 'packed' && (
                        <>
                          <Button
                            size="sm"
                            className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                            onClick={() => setShippingOrder(order)}
                          >
                            <Truck className="mr-1.5 h-3.5 w-3.5" />
                            Mark Shipped
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => setCancelOrderData(order)}
                          >
                            Cancel
                          </Button>
                        </>
                      )}

                      {/* SHIPPED */}
                      {order.status === 'shipped' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-slate-300 text-slate-600 hover:bg-slate-50"
                            onClick={() => setShippingOrder(order)}
                          >
                            Edit Tracking
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setCancelOrderData(order)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      {/* CANCELLED */}
                      {(order.status === 'cancelled') && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 border-slate-300 text-slate-600 hover:bg-slate-50"
                          onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                        >
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                          View Details
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-500">
            Showing <span className="font-medium text-slate-900">{Math.min((page - 1) * itemsPerPage + 1, totalCount)}-{Math.min(page * itemsPerPage, totalCount)}</span> of <span className="font-medium text-slate-900">{totalCount}</span> orders
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="h-8 text-xs bg-white border-slate-200 text-slate-600 hover:text-slate-900"
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, Math.ceil(totalCount / itemsPerPage)) }, (_, i) => {
                const totalPages = Math.ceil(totalCount / itemsPerPage);
                let pNum = i + 1;
                if (totalPages > 5) {
                  if (page <= 3) {
                    pNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pNum = totalPages - 4 + i;
                  } else {
                    pNum = page - 2 + i;
                  }
                }
                if (pNum > totalPages) return null;
                
                return (
                  <button
                    key={pNum}
                    onClick={() => setPage(pNum)}
                    className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${page === pNum ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-white hover:text-slate-900'}`}
                  >
                    {pNum}
                  </button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(Math.ceil(totalCount / itemsPerPage), p + 1))}
              disabled={page >= Math.ceil(totalCount / itemsPerPage) || loading}
              className="h-8 text-xs bg-white border-slate-200 text-slate-600 hover:text-slate-900"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Shipping Dialog */}
      <Dialog open={!!shippingOrder} onOpenChange={(open) => !open && setShippingOrder(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Truck className="h-5 w-5 text-blue-600" />
              Ship Order #{shippingOrder?.id}
            </DialogTitle>
            <DialogDescription>
              Select a shipping provider and enter tracking details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label>Shipping Provider</Label>
              <Select value={shippingCompany} onValueChange={setShippingCompany}>
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DTDC">DTDC Express</SelectItem>
                  <SelectItem value="BlueDart">BlueDart</SelectItem>
                  <SelectItem value="Delhivery">Delhivery</SelectItem>
                  <SelectItem value="IndiaPost">India Post</SelectItem>
                  <SelectItem value="Manual">Manual Delivery (Local)</SelectItem>
                  <SelectItem value="InStore">In-Store Pickup</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {shippingCompany !== "Manual" && shippingCompany !== "InStore" ? (
              <div className="space-y-2">
                <Label>Tracking ID / AWB</Label>
                <Input
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="e.g. D123456789"
                  className="font-mono uppercase rounded-xl h-11"
                />
                {trackingId && (
                  <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded-lg flex items-center gap-2 border border-blue-100">
                    <CheckCircle2 className="h-3 w-3" />
                    Preview: https://www.dtdc.in/tracking.asp?id={trackingId}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex gap-3">
                <Bike className="h-5 w-5 text-slate-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">
                    {shippingCompany === "Manual" ? "Local Delivery Mode" : "Store Pickup Mode"}
                  </h4>
                  <p className="text-xs text-slate-700 mt-1">
                    No tracking ID required. The customer will be notified that their order is {shippingCompany === "Manual" ? "out for delivery" : "ready for pickup"}.
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShippingOrder(null)} className="rounded-lg h-11">Cancel</Button>
            <Button
              onClick={handleShipOrder}
              disabled={isShipping || (shippingCompany !== "Manual" && shippingCompany !== "InStore" && !trackingId)}
              className="bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md shadow-blue-200 h-11 px-6"
            >
              {isShipping ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirm Shipment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={!!cancelOrderData} onOpenChange={(open) => !open && setCancelOrderData(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-red-600">
              <AlertCircle className="h-5 w-5" />
              Cancel Order #{cancelOrderData?.id}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancel-reason">Reason for Cancellation <span className="text-red-500">*</span></Label>
              <Textarea
                id="cancel-reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Customer requested cancellation, Out of stock..."
                className="rounded-xl resize-none"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOrderData(null)} className="rounded-lg h-11">Keep Order</Button>
            <Button
              onClick={handleCancelOrder}
              disabled={isCancelling || !cancelReason.trim()}
              variant="destructive"
              className="rounded-lg shadow-md shadow-red-200 h-11 px-6"
            >
              {isCancelling ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Confirm Cancellation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Packing Mode Overlay */}
      {packingOrder && (
        <PackingMode
          order={packingOrder}
          onComplete={() => {
            setPackingOrder(null);
            fetchOrders();
            toast.success("Packing Complete!", {
              description: `Order #${packingOrder.id.slice(-8)} is ready for shipping`
            });
          }}
          onCancel={() => setPackingOrder(null)}
        />
      )}
    </div>
  );
};

export default Orders;
