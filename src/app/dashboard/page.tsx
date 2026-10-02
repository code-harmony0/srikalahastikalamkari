"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  IndianRupee,
  ShoppingBag,
  Package,
  TrendingUp,
  Clock,
  AlertTriangle,
  MessageSquare,
  Star,
  ArrowRight,
  PackageCheck,
  Truck,
  XCircle
} from "lucide-react";
import dynamic from "next/dynamic";

const DemandFlowChart = dynamic(
  () => import("@/features/dashboard/charts/DemandFlowChart").then((mod) => mod.DemandFlowChart),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
);

import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { KPICard } from "@/features/dashboard/KPICard";
import { ChartCard } from "@/features/dashboard/ChartCard";
import { DataTable, type TableColumn } from "@/features/dashboard/DataTable";
import { StatusBadge, type StatusType } from "@/features/dashboard/StatusBadge";
import { OptimizedImage } from "@/components/shared/OptimizedImage";

import {
  getDashboardAttention,
  getDashboardPerformance,
  getDashboardRecentOrders,
  getDashboardDailyActivity,
  getDashboardTopProducts,
} from "./dashboard.actions";

function ChartSkeleton() {
  return (
    <div className="w-full h-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center min-h-[250px]">
      <div className="w-8 h-8 border-4 border-slate-300 border-t-[#C19A5B] rounded-full animate-spin" />
    </div>
  );
}

function KPICardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 animate-pulse">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-3" />
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-32" />
    </div>
  );
}

function AttentionSkeleton() {
  return (
    <div className="h-[72px] bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse flex-1 min-w-[240px]" />
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const { data: attention, isLoading: attentionLoading } = useQuery({
    queryKey: ["dashboard", "attention"],
    queryFn: getDashboardAttention,
    staleTime: 2 * 60 * 1000,
  });

  const { data: perf, isLoading: perfLoading } = useQuery({
    queryKey: ["dashboard", "performance"],
    queryFn: getDashboardPerformance,
    staleTime: 5 * 60 * 1000,
  });

  const { data: recentOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["dashboard", "recentOrders"],
    queryFn: () => getDashboardRecentOrders(8),
    staleTime: 2 * 60 * 1000,
  });

  const { data: dailyActivity = [], isLoading: activityLoading } = useQuery({
    queryKey: ["dashboard", "dailyActivity"],
    queryFn: () => getDashboardDailyActivity(7),
    staleTime: 5 * 60 * 1000,
  });

  const { data: topProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ["dashboard", "topProducts"],
    queryFn: () => getDashboardTopProducts(30, 5),
    staleTime: 10 * 60 * 1000,
  });

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

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

  const orderColumns: TableColumn<any>[] = [
    {
      key: "id",
      label: "Order ID",
      render: (order) => <span className="font-mono text-xs text-gray-500">#{order.id.slice(0, 8)}</span>,
    },
    {
      key: "customer_name",
      label: "Customer",
      render: (order) => <span className="font-medium text-sm">{order.customer_name || "Guest"}</span>,
    },
    {
      key: "created_at",
      label: "Date",
      render: (order) => (
        <span className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</span>
      ),
    },
    {
      key: "items",
      label: "Items",
      render: (order) => <span className="text-sm text-gray-600 dark:text-gray-400">{order.items_count} items</span>,
    },
    {
      key: "total_amount",
      label: "Amount",
      render: (order) => (
        <span className="font-medium text-sm">
          {order.total_amount !== null ? formatCurrency(order.total_amount) : "-"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (order) => (
        <Badge variant="outline" className={`${getStatusColor(order.status)} border-0 px-3 py-1 flex items-center gap-1.5 w-fit rounded-full font-medium shadow-sm`}>
          {getStatusIcon(order.status)}
          <span className="capitalize">{getStatusLabel(order.status)}</span>
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "",
      align: "right",
      render: () => (
        <div className="flex justify-end opacity-50 hover:opacity-100 transition-opacity">
          <ArrowRight className="h-4 w-4" />
        </div>
      )
    }
  ];

  const productColumns: TableColumn<any>[] = [
    {
      key: "name",
      label: "Product",
      render: (product) => (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 rounded bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
            <OptimizedImage
              src={product.image || null}
              alt={product.name}
              fill
              className="object-cover"
              imageType="thumbnail"
              sizes="40px"
              placeholder="empty"
            />
          </div>
          <span className="font-medium text-sm line-clamp-1">{product.name}</span>
        </div>
      ),
    },
    { key: "total_sold", label: "Units Sold", align: "center", render: (p) => <span className="text-sm">{p.total_sold}</span> },
    {
      key: "revenue",
      label: "Revenue",
      align: "right",
      render: (product) => (
        <span className="font-semibold text-sm text-green-600 dark:text-green-400">
          {product.revenue !== null ? formatCurrency(product.revenue) : "-"}
        </span>
      ),
    },
  ];

  // RBAC respects null returned for missing permissions
  const showPendingOrders = attention?.pending_orders !== null && attention?.pending_orders !== undefined;
  const showLowStock = attention?.low_stock !== null && attention?.low_stock !== undefined;
  const showInquiries = attention?.unread_inquiries !== null && attention?.unread_inquiries !== undefined;
  const showReviews = attention?.pending_reviews !== null && attention?.pending_reviews !== undefined;

  const hasAttentionItems = 
    (showPendingOrders && (attention.pending_orders ?? 0) > 0) || 
    (showLowStock && (attention.low_stock ?? 0) > 0) || 
    (showInquiries && (attention.unread_inquiries ?? 0) > 0) || 
    (showReviews && (attention.pending_reviews ?? 0) > 0);

  const hasActivity = dailyActivity.some(d => d.orders > 0);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-4 md:p-8">
      <div className="max-w-[1440px] mx-auto space-y-8">
        
        {/* SECTION 1: ACTION / ATTENTION */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Needs Attention</h2>
          
          {attentionLoading ? (
            <div className="flex flex-wrap gap-4">
              <AttentionSkeleton /><AttentionSkeleton /><AttentionSkeleton />
            </div>
          ) : hasAttentionItems ? (
            <div className="flex flex-wrap gap-4">
              {showPendingOrders && (attention.pending_orders ?? 0) > 0 && (
                <Card className="flex-1 min-w-[240px] border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900 cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors shadow-sm" onClick={() => router.push("/dashboard/orders?status=pending")}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/60 rounded-full">
                      <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-orange-900 dark:text-orange-100">{attention.pending_orders} Orders Pending</p>
                      <p className="text-xs text-orange-700 dark:text-orange-300">Requires fulfillment</p>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {showLowStock && (attention.low_stock ?? 0) > 0 && (
                <Card className="flex-1 min-w-[240px] border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shadow-sm" onClick={() => router.push("/dashboard/products?filter=low_stock")}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/60 rounded-full">
                      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-red-900 dark:text-red-100">{attention.low_stock} Low Stock</p>
                      <p className="text-xs text-red-700 dark:text-red-300">Products need restock</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {showInquiries && (attention.unread_inquiries ?? 0) > 0 && (
                <Card className="flex-1 min-w-[240px] border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors shadow-sm" onClick={() => router.push("/dashboard/inquiries?status=new")}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/60 rounded-full">
                      <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-blue-900 dark:text-blue-100">{attention.unread_inquiries} Unread Inquiries</p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">Customer messages</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {showReviews && (attention.pending_reviews ?? 0) > 0 && (
                <Card className="flex-1 min-w-[240px] border-purple-200 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-900 cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors shadow-sm" onClick={() => router.push("/dashboard/reviews?status=pending")}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/60 rounded-full">
                      <Star className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-purple-900 dark:text-purple-100">{attention.pending_reviews} Pending Reviews</p>
                      <p className="text-xs text-purple-700 dark:text-purple-300">Require approval</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
             <div className="bg-white dark:bg-slate-800/50 rounded-xl p-5 text-sm text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 flex items-center gap-2">
               <CheckCircleIcon className="h-4 w-4 text-green-500" /> All caught up! No pending operational items.
             </div>
          )}
        </section>

        {/* SECTION 2: BUSINESS PERFORMANCE */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Business Performance (This Month)</h2>
          <div className="flex flex-wrap gap-4">
            {perfLoading ? (
              <>
                <div className="flex-1 min-w-[250px]"><KPICardSkeleton /></div>
                <div className="flex-1 min-w-[250px]"><KPICardSkeleton /></div>
                <div className="flex-1 min-w-[250px]"><KPICardSkeleton /></div>
              </>
            ) : (
              <>
                {perf?.total_revenue !== null && (
                  <div className="flex-1 min-w-[250px]">
                    <KPICard
                      title="Revenue"
                      value={formatCurrency(perf?.total_revenue || 0)}
                      icon={<IndianRupee className="h-4 w-4" />}
                      trend={perf?.has_prior_revenue && perf?.revenue_growth !== null ? { 
                        value: Number(Math.abs(perf.revenue_growth).toFixed(1)), 
                        direction: perf.revenue_growth > 0 ? "up" : perf.revenue_growth < 0 ? "down" : "neutral" 
                      } : undefined}
                      comparison={perf?.has_prior_revenue ? "vs last month" : "No prior data"}
                      variant="primary"
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-[250px]">
                  <KPICard
                    title="Orders"
                    value={perf?.total_orders || 0}
                    icon={<ShoppingBag className="h-4 w-4" />}
                    trend={perf?.has_prior_orders && perf?.orders_growth !== null ? { 
                      value: Number(Math.abs(perf.orders_growth).toFixed(1)), 
                      direction: perf.orders_growth > 0 ? "up" : perf.orders_growth < 0 ? "down" : "neutral" 
                    } : undefined}
                    comparison={perf?.has_prior_orders ? "vs last month" : "No prior data"}
                    variant="default"
                    onClick={() => router.push("/dashboard/orders")}
                  />
                </div>

                {perf?.avg_order_value !== null && (
                  <div className="flex-1 min-w-[250px]">
                    <KPICard
                      title="Average Order Value"
                      value={formatCurrency(perf?.avg_order_value || 0)}
                      icon={<TrendingUp className="h-4 w-4" />}
                      variant="default"
                      comparison={`from ${perf?.aov_orders_count || 0} orders`}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* SECTION 3: OPERATIONS */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Operations</h2>
          <DataTable
            title="Latest Orders"
            icon={<ShoppingBag className="h-5 w-5" />}
            columns={orderColumns}
            data={recentOrders}
            onRowClick={(order) => router.push(`/dashboard/orders/${order.id}`)}
            emptyState={{ icon: <ShoppingBag className="h-10 w-10 text-gray-300" />, message: "No latest orders available." }}
          />
        </section>

        {/* SECTION 4: ANALYTICS / PERFORMANCE */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Analytics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
            <ChartCard title="Daily Order Activity (Last 7 Days)" icon={<TrendingUp className="h-5 w-5" />}>
              {activityLoading ? (
                <ChartSkeleton />
              ) : hasActivity ? (
                <DemandFlowChart data={dailyActivity} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-gray-400">
                  <TrendingUp className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-sm">No orders in the last 7 days.</p>
                </div>
              )}
            </ChartCard>

            <DataTable
              title="Top Products (Last 30 Days)"
              icon={<Package className="h-5 w-5" />}
              columns={productColumns}
              data={topProducts}
              onRowClick={(product) => router.push(`/dashboard/products/${product.id}`)}
              emptyState={{ icon: <Package className="h-10 w-10 text-gray-300" />, message: "No product sales data in the last 30 days." }}
            />
          </div>
        </section>

      </div>
    </div>
  );
}

function CheckCircleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
