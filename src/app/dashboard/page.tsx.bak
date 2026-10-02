"use client";

import * as React from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  IndianRupee,
  ShoppingBag,
  Package,
  CheckCircle,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import dynamic from "next/dynamic";

// Lazy load charts for code splitting
const DemandFlowChart = dynamic(
  () => import("@/features/dashboard/charts/DemandFlowChart").then((mod) => mod.DemandFlowChart),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
);

const CategoryBarChart = dynamic(
  () => import("@/features/dashboard/charts/CategoryBarChart").then((mod) => mod.CategoryBarChart),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
);

// Import dashboard services
import {
  getDashboardKPIs,
  getDailyActivity,
  getTopCategoriesBySales,
  getTopProducts,
  getRecentOrders,
  getKPISparklines,
} from "@/services/dashboard";
import { KPICard } from "@/features/dashboard/KPICard";
import { ChartCard } from "@/features/dashboard/ChartCard";
import { DataTable, type TableColumn } from "@/features/dashboard/DataTable";
import { StatusBadge, type StatusType } from "@/features/dashboard/StatusBadge";
import { dashboardKeys } from "@/shared/lib/query-client";
import { OptimizedImage } from "@/components/shared/OptimizedImage";

// Skeleton loader for charts
function ChartSkeleton() {
  return (
    <div className="w-full h-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-300 border-t-[#C19A5B] rounded-full animate-spin" />
    </div>
  );
}

// Skeleton for KPI cards
function KPICardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 animate-pulse">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-4" />
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-32" />
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  // Use React Query for automatic caching and background updates
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: dashboardKeys.kpis(),
    queryFn: getDashboardKPIs,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: dailyActivity = [], isLoading: activityLoading } = useQuery({
    queryKey: dashboardKeys.activity(7),
    queryFn: () => getDailyActivity(7),
    staleTime: 5 * 60 * 1000,
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: dashboardKeys.categories(),
    queryFn: () => getTopCategoriesBySales(6),
    staleTime: 10 * 60 * 1000, // 10 minutes - less volatile
  });

  // Parallel queries for bottom tables
  const tableQueries = useQueries({
    queries: [
      {
        queryKey: dashboardKeys.products(),
        queryFn: () => getTopProducts(5),
        staleTime: 10 * 60 * 1000,
      },
      {
        queryKey: dashboardKeys.orders(),
        queryFn: () => getRecentOrders(6),
        staleTime: 2 * 60 * 1000, // 2 minutes - more volatile
      },
      {
        queryKey: dashboardKeys.sparklines(),
        queryFn: getKPISparklines,
        staleTime: 5 * 60 * 1000,
      },
    ],
  });

  const [topProductsQuery, recentOrdersQuery, sparklinesQuery] = tableQueries;
  const topProducts = topProductsQuery.data || [];
  const recentOrders = recentOrdersQuery.data || [];
  const sparklines = sparklinesQuery.data;

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

  const orderColumns: TableColumn<any>[] = [
    {
      key: "id",
      label: "Order ID",
      render: (order) => <span className="font-mono text-xs text-gray-500">#{order.id.slice(0, 8)}</span>,
    },
    {
      key: "customer_name",
      label: "Customer",
      render: (order) => <span className="font-medium">{order.customer_name || "Guest"}</span>,
    },
    {
      key: "created_at",
      label: "Date",
      render: (order) => (
        <span className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</span>
      ),
    },
    {
      key: "total_amount",
      label: "Amount",
      render: (order) => <span className="font-medium">{formatCurrency(order.total_amount)}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (order) => <StatusBadge status={order.status as StatusType} label={order.status.replace("_", " ")} />,
    },
  ];

  const productColumns: TableColumn<any>[] = [
    {
      key: "name",
      label: "Product",
      render: (product) => (
        <div className="flex items-center gap-2">
          <div className="relative h-10 w-10 rounded bg-gray-100 dark:bg-gray-700 overflow-hidden">
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
          <span className="font-medium line-clamp-1">{product.name}</span>
        </div>
      ),
    },
    { key: "total_sold", label: "Sold", align: "center", render: (p) => <span>{p.total_sold}</span> },
    {
      key: "revenue",
      label: "Revenue",
      align: "right",
      render: (product) => (
        <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(product.revenue)}</span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-[1440px] mx-auto space-y-8">
        {/* KPI Cards with skeleton loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpisLoading ? (
            <>
              <KPICardSkeleton />
              <KPICardSkeleton />
              <KPICardSkeleton />
              <KPICardSkeleton />
            </>
          ) : (
            <>
              <KPICard
                title="Total Revenue"
                value={formatCurrency(kpis?.total_revenue || 0)}
                icon={<IndianRupee className="h-5 w-5" />}
                trend={{ value: Number((kpis?.revenue_growth || 0).toFixed(1)), direction: (kpis?.revenue_growth ?? 0) > 0 ? "up" : (kpis?.revenue_growth ?? 0) < 0 ? "down" : "neutral" }}
                sparklineData={sparklines?.revenue}
                sparklineColor="#FFFFFF"
                comparison="vs last month"
                variant="primary"
                onClick={() => router.push("/dashboard/orders")}
              />
              <KPICard
                title="Orders Placed"
                value={kpis?.total_orders || 0}
                icon={<ShoppingBag className="h-5 w-5" />}
                trend={{ value: Number((kpis?.orders_growth || 0).toFixed(1)), direction: (kpis?.orders_growth ?? 0) > 0 ? "up" : (kpis?.orders_growth ?? 0) < 0 ? "down" : "neutral" }}
                sparklineData={sparklines?.orders}
                sparklineColor="#16A34A"
                comparison="vs last month"
                variant="default"
                onClick={() => router.push("/dashboard/orders")}
              />
              <KPICard
                title="Products in Stock"
                value={kpis?.product_count || 0}
                icon={<Package className="h-5 w-5" />}
                trend={undefined}
                sparklineData={sparklines?.items_sold}
                sparklineColor="#F59E0B"
                comparison={`Avg order: ${formatCurrency(kpis?.avg_order_value || 0)}`}
                variant="default"
                onClick={() => router.push("/dashboard/products")}
              />
              <KPICard
                title="Completion Rate"
                value={`${Math.round(kpis?.completion_rate || 0)}%`}
                icon={<CheckCircle className="h-5 w-5" />}
                trend={{ value: Number((kpis?.completion_rate_growth || 0).toFixed(1)), direction: (kpis?.completion_rate_growth ?? 0) > 0 ? "up" : (kpis?.completion_rate_growth ?? 0) < 0 ? "down" : "neutral" }}
                sparklineData={sparklines?.completion}
                sparklineColor="#2563EB"
                comparison={`${kpis?.shipped_orders || 0} of ${kpis?.total_orders || 0} shipped`}
                variant="default"
                onClick={() => router.push("/dashboard/orders?status=shipped")}
              />
            </>
          )}
        </div>

        {/* Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard title="Daily Order Activity" icon={<TrendingUp className="h-5 w-5" />} className="lg:col-span-2">
            {activityLoading ? <ChartSkeleton /> : <DemandFlowChart data={dailyActivity} />}
          </ChartCard>

          <ChartCard title="Top Kalamkari Categories" icon={<BarChart3 className="h-5 w-5" />}>
            {categoriesLoading ? (
              <ChartSkeleton />
            ) : categories.length > 0 ? (
              <CategoryBarChart data={categories} />
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-gray-400">No category sales data yet</div>
            )}
          </ChartCard>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
          <DataTable
            title="Recent Orders"
            icon={<ShoppingBag className="h-5 w-5" />}
            columns={orderColumns}
            data={recentOrders}
            onRowClick={(order) => router.push(`/dashboard/orders/${order.id}`)}
            emptyState={{ icon: <ShoppingBag className="h-12 w-12" />, message: "No recent orders" }}
          />
          <DataTable
            title="Top Products"
            icon={<Package className="h-5 w-5" />}
            columns={productColumns}
            data={topProducts}
            onRowClick={(product) => router.push(`/dashboard/products/${product.id}`)}
            emptyState={{ icon: <Package className="h-12 w-12" />, message: "No product data" }}
          />
        </div>
      </div>
    </div>
  );
}
