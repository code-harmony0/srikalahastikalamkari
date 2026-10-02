"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/dashboard/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  RefreshCw,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  PackageCheck,
  MoreHorizontal,
  AlertCircle,
  XCircle,
  Bike,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import PackingMode from "@/app/dashboard/components/PackingMode";

import { shipOrder, getOrderStatistics, updateOrderStatus, cancelOrder } from "@/services/orders";
import { fetchAdminOrders, bulkUpdateOrderStatus } from "./orders.actions";
import { Label } from "@/app/dashboard/ui/label";
import { Input } from "@/app/dashboard/ui/input";
import { Textarea } from "@/app/dashboard/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/dashboard/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";

export interface Order {
  id: string;
  created_at: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  total_amount: number;
  status: string;
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
  shipping_company?: string;
  tracking_id?: string;
  packed_at?: string;
  shipped_at?: string;
}

const Orders = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter, search, and selection state
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;

  // Modals state
  const [packingOrder, setPackingOrder] = useState<Order | null>(null);
  const [shippingOrder, setShippingOrder] = useState<Order | null>(null);
  const [shippingCompany, setShippingCompany] = useState("DTDC");
  const [customCourierName, setCustomCourierName] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [isShipping, setIsShipping] = useState(false);

  const [cancelOrderData, setCancelOrderData] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const [stats, setStats] = useState<any>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1); // reset to page 1 on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, dateFilter]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { orders: fetchedOrders, count } = await fetchAdminOrders({
        status: statusFilter,
        search: debouncedSearchQuery,
        dateRange: dateFilter,
        page,
        limit: itemsPerPage,
      });
      setOrders(fetchedOrders as any);
      setTotalCount(count);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast.error("Error fetching orders", {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearchQuery, dateFilter, page, itemsPerPage]);

  const fetchStats = async () => {
    const data = await getOrderStatistics();
    if (data) setStats(data);
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleShipOrder = async () => {
    if (!shippingOrder) return;

    if (shippingCompany !== "Manual" && shippingCompany !== "InStore" && !trackingId) {
      toast.error("Tracking ID Required", { description: "Please enter a tracking ID." });
      return;
    }

    if (shippingCompany === "Other" && !customCourierName.trim()) {
      toast.error("Courier Name Required", { description: "Please specify the courier name." });
      return;
    }

    setIsShipping(true);
    const finalTrackingId = (shippingCompany === "Manual" || shippingCompany === "InStore") ? "MANUAL_DELIVERY" : trackingId;
    const finalCompany = shippingCompany === "Other" ? customCourierName : shippingCompany;

    const { error } = await shipOrder(shippingOrder.id, {
      shipping_company: finalCompany,
      tracking_id: finalTrackingId
    });

    setIsShipping(false);

    if (error) {
      toast.error("Failed to update shipping status");
    } else {
      toast.success("Order Shipped!");
      setShippingOrder(null);
      setTrackingId("");
      setCustomCourierName("");
      setShippingCompany("DTDC");
      fetchOrders();
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelOrderData || !cancelReason.trim()) return;

    setIsCancelling(true);
    const { error } = await cancelOrder(cancelOrderData.id, cancelReason);
    setIsCancelling(false);

    if (error) {
      toast.error("Failed to cancel order");
    } else {
      toast.success("Order Cancelled");
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
      toast.success("Status Updated");
      fetchOrders();
    }
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedOrders.length === 0) return;
    setIsBulkUpdating(true);
    const { success, error } = await bulkUpdateOrderStatus(selectedOrders, newStatus);
    setIsBulkUpdating(false);

    if (success) {
      toast.success(`Updated ${selectedOrders.length} orders`);
      setSelectedOrders([]);
      fetchOrders();
    } else {
      toast.error("Failed to bulk update orders", { description: error });
    }
  };

  const toggleOrderSelection = (id: string) => {
    setSelectedOrders(prev => prev.includes(id) ? prev.filter(oId => oId !== id) : [...prev, id]);
  };

  const toggleAllSelection = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(orders.map(o => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-slate-100 text-slate-700 border-slate-300";
      case "paid": return "bg-slate-100 text-slate-800 border-slate-300";
      case "in_packing": return "bg-blue-50 text-blue-800 border-blue-200";
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
      case "pending": return "Unpaid";
      case "paid": return "Paid";
      case "in_packing": return "Processing";
      case "packed": return "Packed";
      case "shipped": return "Shipped";
      case "cancelled": return "Cancelled";
      default: return status.replace('_', ' ');
    }
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-6 font-sans space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Orders</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and track all customer orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchOrders} disabled={loading} variant="ghost" className="h-9 hover:bg-slate-200/50 border-0 text-slate-600">
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><Package className="h-6 w-6" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Orders</p>
              <p className="text-2xl font-bold text-slate-900">{Number(stats.total_orders) || 0}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center text-green-600"><Clock className="h-6 w-6" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Today's Orders</p>
              <p className="text-2xl font-bold text-slate-900">{Number(stats.todayCount) || 0}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"><PackageCheck className="h-6 w-6" /></div>
            <div>
              <p className="text-sm font-medium text-slate-800">Pending Action</p>
              <p className="text-2xl font-bold text-slate-900">{(Number(stats.pending_orders) || 0) + (Number(stats.processing_orders) || 0)}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600"><CheckCircle2 className="h-6 w-6" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Today's Revenue</p>
              <p className="text-2xl font-bold text-slate-900">₹{(Number(stats.todayRevenue) || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col xl:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 w-full items-center">
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto overflow-x-auto">
            <TabsList className="bg-slate-100/80 p-1 h-auto rounded-lg gap-1">
              {["all", "pending", "paid", "in_packing", "packed", "shipped", "cancelled"].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:font-semibold px-4 py-2 text-sm text-slate-600 transition-all whitespace-nowrap"
                >
                  {getStatusLabel(tab)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full md:w-40 bg-slate-50 h-10 border-slate-300">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative w-full xl:w-80 flex-shrink-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, Name, Email, Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 focus:bg-white text-sm transition-all h-10"
          />
        </div>
      </div>

      {selectedOrders.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between shadow-sm animate-in fade-in">
          <span className="text-sm font-medium text-blue-800">{selectedOrders.length} orders selected</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-600 mr-2">Mark as:</span>
            <Button size="sm" variant="outline" className="h-8 bg-white" onClick={() => handleBulkStatusUpdate("in_packing")} disabled={isBulkUpdating}>Processing</Button>
            <Button size="sm" variant="outline" className="h-8 bg-white" onClick={() => handleBulkStatusUpdate("packed")} disabled={isBulkUpdating}>Packed</Button>
          </div>
        </div>
      )}

      {/* Orders List (Responsive) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Desktop/Tablet Table View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 border-b border-slate-100">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="w-12 pl-4 py-3">
                  <Checkbox
                    checked={orders.length > 0 && selectedOrders.length === orders.length}
                    onCheckedChange={(checked) => toggleAllSelection(checked as boolean)}
                  />
                </TableHead>
                <TableHead className="w-1/3 font-semibold text-slate-700 py-3">Customer</TableHead>
                <TableHead className="w-[100px] font-semibold text-slate-700 py-3">Date</TableHead>
                <TableHead className="w-[120px] font-semibold text-slate-700 py-3">Contact</TableHead>
                <TableHead className="w-[100px] font-semibold text-slate-700 py-3">Items</TableHead>
                <TableHead className="w-[120px] font-semibold text-slate-700 py-3 text-right">Amount</TableHead>
                <TableHead className="w-[140px] font-semibold text-slate-700 py-3">Status</TableHead>
                <TableHead className="w-[160px] text-right font-semibold text-slate-700 pr-6 py-3">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16 text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4"><Search className="h-8 w-8 text-slate-300" /></div>
                      <p className="text-lg font-medium text-slate-900">No orders found</p>
                      <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or search query</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-slate-50/80 transition-colors border-slate-50">
                    <TableCell className="pl-4 py-3">
                      <Checkbox
                        checked={selectedOrders.includes(order.id)}
                        onCheckedChange={() => toggleOrderSelection(order.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-slate-900 py-3 cursor-pointer" onClick={() => router.push(`/dashboard/orders/${order.id}`)}>
                      <div className="font-bold text-sm text-slate-900">
                        {order.shipping_address?.firstName 
                          ? `${order.shipping_address.firstName} ${order.shipping_address.lastName || ''}`.trim()
                          : order.customer_email || 'Guest'}
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">#{order.id.slice(-8)}</div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 py-3 cursor-pointer" onClick={() => router.push(`/dashboard/orders/${order.id}`)}>
                      {new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 py-3 cursor-pointer" onClick={() => router.push(`/dashboard/orders/${order.id}`)}>
                      {order.shipping_address?.phone || order.customer_phone || "-"}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 py-3 cursor-pointer" onClick={() => router.push(`/dashboard/orders/${order.id}`)}>
                      {order.order_items?.reduce((acc, item) => acc + item.quantity, 0) || 0} items
                    </TableCell>
                    <TableCell className="text-right font-semibold text-slate-900 py-3 cursor-pointer" onClick={() => router.push(`/dashboard/orders/${order.id}`)}>
                      {formatCurrency(order.total_amount)}
                    </TableCell>
                    <TableCell className="py-3 cursor-pointer" onClick={() => router.push(`/dashboard/orders/${order.id}`)}>
                      <Badge variant="outline" className={`${getStatusColor(order.status)} border-0 px-2.5 py-0.5 flex items-center gap-1.5 w-fit rounded-full font-medium shadow-sm`}>
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{getStatusLabel(order.status)}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {(order.status === "paid" || order.status === "pending") && (
                          <Button size="sm" onClick={(e) => { e.stopPropagation(); setPackingOrder(order); handleStatusUpdate(order.id, 'in_packing'); }} className="h-8 bg-slate-900 hover:bg-slate-800 text-white px-3">
                            Pack
                          </Button>
                        )}
                        {order.status === "packed" && (
                          <Button size="sm" onClick={(e) => { e.stopPropagation(); setShippingOrder(order); }} className="h-8 bg-blue-600 hover:bg-blue-700 text-white px-3">
                            Ship
                          </Button>
                        )}
                        {order.status === "shipped" && (
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setShippingOrder(order); }} className="h-8 px-3">
                            Edit Tracking
                          </Button>
                        )}
                        {order.status === "in_packing" && (
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setPackingOrder(order); }} className="h-8 px-3 text-blue-600 border-blue-200 hover:bg-blue-50">
                            Resume
                          </Button>
                        )}

                        {order.status !== "cancelled" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()} className="h-8 w-8 p-0 border border-transparent hover:border-slate-200">
                                <MoreHorizontal className="h-4 w-4 text-slate-600" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={(e) => { e.stopPropagation(); setCancelOrderData(order); }}>Cancel Order</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-slate-100">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <div className="flex flex-col items-center justify-center">
                <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mb-3"><Search className="h-6 w-6 text-slate-300" /></div>
                <p className="text-base font-medium text-slate-900">No orders found</p>
                <p className="text-xs text-slate-500 mt-1">Try adjusting your filters</p>
              </div>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedOrders.includes(order.id)}
                      onCheckedChange={() => toggleOrderSelection(order.id)}
                      className="mt-1"
                    />
                    <div onClick={() => router.push(`/dashboard/orders/${order.id}`)}>
                      <div className="font-bold text-sm text-slate-900">
                        {order.shipping_address?.firstName 
                          ? `${order.shipping_address.firstName} ${order.shipping_address.lastName || ''}`.trim()
                          : order.customer_email || 'Guest'}
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">#{order.id.slice(-8)} &middot; {new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</div>
                    </div>
                  </div>
                  
                  {order.status !== "cancelled" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()} className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-5 w-5 text-slate-600" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {(order.status === "paid" || order.status === "pending") && (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setPackingOrder(order); handleStatusUpdate(order.id, 'in_packing'); }}>Start Packing</DropdownMenuItem>
                        )}
                        {order.status === "in_packing" && (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setPackingOrder(order); }}>Resume Packing</DropdownMenuItem>
                        )}
                        {(order.status === "in_packing" || order.status === "packed") && (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setShippingOrder(order); }}>Mark Shipped</DropdownMenuItem>
                        )}
                        {order.status === "shipped" && (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setShippingOrder(order); }}>Edit Tracking</DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={(e) => { e.stopPropagation(); setCancelOrderData(order); }}>Cancel Order</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                
                <div className="flex justify-between items-center pl-7" onClick={() => router.push(`/dashboard/orders/${order.id}`)}>
                  <div className="flex flex-col gap-1.5">
                    <div className="text-xs text-slate-600 font-medium">
                      {order.order_items?.reduce((acc, item) => acc + item.quantity, 0) || 0} items &middot; {formatCurrency(order.total_amount)}
                    </div>
                    <Badge variant="outline" className={`${getStatusColor(order.status)} border-0 px-2 py-0.5 flex items-center gap-1 w-fit rounded-full text-[10px] font-medium shadow-sm`}>
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{getStatusLabel(order.status)}</span>
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-500">
            Showing <span className="font-medium text-slate-900">{orders.length > 0 ? (page - 1) * itemsPerPage + 1 : 0}-{Math.min(page * itemsPerPage, totalCount)}</span> of <span className="font-medium text-slate-900">{totalCount}</span> orders
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading} className="h-8 text-xs bg-white border-slate-200">Previous</Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(Math.ceil(totalCount / itemsPerPage), p + 1))} disabled={page >= Math.ceil(totalCount / itemsPerPage) || loading} className="h-8 text-xs bg-white border-slate-200">Next</Button>
          </div>
        </div>
      </div>

      <Dialog open={!!shippingOrder} onOpenChange={(open) => !open && setShippingOrder(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl"><Truck className="h-5 w-5 text-blue-600" />Ship Order #{shippingOrder?.id.slice(-8)}</DialogTitle>
            <DialogDescription>Select a shipping provider and enter tracking details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label>Shipping Provider</Label>
              <Select value={shippingCompany} onValueChange={setShippingCompany}>
                <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DTDC">DTDC Express</SelectItem>
                  <SelectItem value="BlueDart">BlueDart</SelectItem>
                  <SelectItem value="Delhivery">Delhivery</SelectItem>
                  <SelectItem value="IndiaPost">India Post</SelectItem>
                  <SelectItem value="Manual">Manual Delivery (Local)</SelectItem>
                  <SelectItem value="InStore">In-Store Pickup</SelectItem>
                  <SelectItem value="Other">Other / Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {shippingCompany === "Other" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label>Custom Courier Name</Label>
                <Input value={customCourierName} onChange={(e) => setCustomCourierName(e.target.value)} placeholder="e.g. FedEx" className="rounded-xl h-11" />
              </div>
            )}

            {shippingCompany !== "Manual" && shippingCompany !== "InStore" ? (
              <div className="space-y-2">
                <Label>Tracking ID / AWB</Label>
                <Input value={trackingId} onChange={(e) => setTrackingId(e.target.value)} placeholder="e.g. D123456789" className="font-mono uppercase rounded-xl h-11" />
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex gap-3">
                <Bike className="h-5 w-5 text-slate-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">{shippingCompany === "Manual" ? "Local Delivery Mode" : "Store Pickup Mode"}</h4>
                  <p className="text-xs text-slate-700 mt-1">No tracking ID required. The customer will be notified that their order is {shippingCompany === "Manual" ? "out for delivery" : "ready for pickup"}.</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShippingOrder(null)} className="rounded-lg h-11">Cancel</Button>
            <Button onClick={handleShipOrder} disabled={isShipping || (shippingCompany !== "Manual" && shippingCompany !== "InStore" && !trackingId)} className="bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md shadow-blue-200 h-11 px-6">
              {isShipping ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Updating...</> : <><CheckCircle2 className="mr-2 h-4 w-4" />Confirm Shipment</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!cancelOrderData} onOpenChange={(open) => !open && setCancelOrderData(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-red-600"><AlertCircle className="h-5 w-5" />Cancel Order #{cancelOrderData?.id.slice(-8)}</DialogTitle>
            <DialogDescription>Are you sure you want to cancel this order? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason for cancellation</Label>
              <Textarea value={cancelReason} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCancelReason(e.target.value)} placeholder="e.g. Out of stock, Customer requested..." className="resize-none h-24 rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOrderData(null)} disabled={isCancelling} className="rounded-lg h-11">Keep Order</Button>
            <Button onClick={handleCancelOrder} disabled={isCancelling || !cancelReason.trim()} variant="destructive" className="rounded-lg h-11 px-6">
              {isCancelling ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Cancelling...</> : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {packingOrder && (
        <PackingMode order={packingOrder} onCancel={() => { setPackingOrder(null); fetchOrders(); }} onComplete={() => { setPackingOrder(null); fetchOrders(); }} />
      )}
    </div>
  );
};

export default Orders;
