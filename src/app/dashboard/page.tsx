"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  IndianRupee,
  ShoppingBag,
  Package,
  CheckCircle,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import {
  getDashboardKPIs,
  getDailyActivity,
  getTopCategoriesBySales,
  getTopProducts,
  getRecentOrders,
  getKPISparklines,
  type DashboardKPIs,
  type DailyActivity,
  type CategorySales,
  type TopProduct,
  type OrderPreview,
  type SparklinePoint,
} from "@/services/dashboard";
import { KPICard } from "@/features/dashboard/KPICard";
import { ChartCard } from "@/features/dashboard/ChartCard";
import { DataTable, type TableColumn } from "@/features/dashboard/DataTable";
import { StatusBadge, type StatusType } from "@/features/dashboard/StatusBadge";
import dynamic from "next/dynamic";

const DemandFlowChart = dynamic(
  () =>
    import("@/features/dashboard/charts/DemandFlowChart").then(
      (mod) => mod.DemandFlowChart
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl" />
    ),
  }
);

const CategoryBarChart = dynamic(
  () =>
    import("@/features/dashboard/charts/CategoryBarChart").then(
      (mod) => mod.CategoryBarChart
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl" />
    ),
  }
);

/**
 * Modern Dashboard Page
 *
 * All data is fetched from Supabase - no hardcoded/mock data.
 *
 * Layout:
 * - KPI cards: 4 columns (desktop), 2 (tablet), 1 (mobile)
 * - Analytics row: Demand Flow (2/3) + Category Sales (1/3)
 * - Tables row: Recent Orders + Top Products
 */

export default function DashboardPage() {
  const router = useRouter();

  // All state from real Supabase data
  const [kpis, setKpis] = React.useState<DashboardKPIs | null>(null);
  const [dailyActivity, setDailyActivity] = React.useState<DailyActivity[]>([]);
  const [categories, setCategories] = React.useState<CategorySales[]>([]);
  const [topProducts, setTopProducts] = React.useState<TopProduct[]>([]);
  const [recentOrders, setRecentOrders] = React.useState<OrderPreview[]>([]);
  const [sparklines, setSparklines] = React.useState<{
    revenue: SparklinePoint[];
    orders: SparklinePoint[];
    items_sold: SparklinePoint[];
    completion: SparklinePoint[];
  } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchAllDashboardData();
  }, []);

  const fetchAllDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all dashboard data in parallel
      const [kpiData, activityData, categoryData, productData, orderData, sparklineData] =
        await Promise.all([
          getDashboardKPIs(),
          getDailyActivity(7),
          getTopCategoriesBySales(6),
          getTopProducts(5),
          getRecentOrders(8),
          getKPISparklines(),
        ]);

      setKpis(kpiData);
      setDailyActivity(activityData);
      setCategories(categoryData);
      setTopProducts(productData);
      setRecentOrders(orderData);
      setSparklines(sparklineData);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const getOrderStatus = (status: string): StatusType => {
    switch (status) {
      case "delivered":
        return "success";
      case "shipped":
        return "info";
      case "packed":
        return "warning";
      case "in_packing":
        return "processing";
      case "paid":
      case "pending":
        return "pending";
      case "cancelled":
        return "danger";
      default:
        return "neutral";
    }
  };

  const formatCurrency = (amount: number) =>
    `₹${amount.toLocaleString("en-IN")}`;

  const formatStatus = (status: string) => {
    if (status === "in_packing") return "Processing";
    return status.replace(/_/g, " ");
  };

  // ─── Table Columns ─────────────────────────────────────────────────────────

  const orderColumns: TableColumn<OrderPreview>[] = [
    {
      key: "customer_name",
      label: "Customer",
      render: (order) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400 font-semibold text-sm">
            {order.customer_name?.charAt(0).toUpperCase() || "?"}
          </div>
          <span className="font-medium">
            {order.customer_name || "Unknown"}
          </span>
        </div>
      ),
    },
    {
      key: "total_amount",
      label: "Amount",
      align: "right",
      render: (order) => (
        <span className="font-semibold">
          {formatCurrency(order.total_amount)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (order) => (
        <StatusBadge
          status={getOrderStatus(order.status)}
          label={formatStatus(order.status)}
        />
      ),
    },
    {
      key: "created_at",
      label: "Date",
      align: "right",
      render: (order) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(order.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          })}
        </span>
      ),
    },
  ];

  const productColumns: TableColumn<TopProduct>[] = [
    {
      key: "name",
      label: "Product",
      render: (product) => (
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="font-medium line-clamp-1">{product.name}</span>
        </div>
      ),
    },
    {
      key: "total_sold",
      label: "Sold",
      align: "center",
      render: (product) => <span>{product.total_sold}</span>,
    },
    {
      key: "revenue",
      label: "Revenue",
      align: "right",
      render: (product) => (
        <span className="font-semibold text-green-600 dark:text-green-400">
          {formatCurrency(product.revenue)}
        </span>
      ),
    },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-[1440px] mx-auto space-y-8">
        {/* KPI Cards - Real data with real month-over-month growth */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total Revenue"
            value={formatCurrency(kpis?.total_revenue || 0)}
            icon={<IndianRupee className="h-5 w-5" />}
            trend={{
              value: Number((kpis?.revenue_growth || 0).toFixed(1)),
              direction: (kpis?.revenue_growth || 0) >= 0 ? "up" : "down",
            }}
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
            trend={{
              value: Number((kpis?.orders_growth || 0).toFixed(1)),
              direction: (kpis?.orders_growth || 0) >= 0 ? "up" : "down",
            }}
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
            trend={{
              value: Number((kpis?.avg_order_value || 0).toFixed(0)),
              direction: "neutral",
            }}
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
            trend={{
              value: Number((kpis?.completion_rate || 0).toFixed(1)),
              direction:
                (kpis?.completion_rate || 0) >= 50
                  ? "up"
                  : (kpis?.completion_rate || 0) > 0
                  ? "down"
                  : "neutral",
            }}
            sparklineData={sparklines?.completion}
            sparklineColor="#2563EB"
            comparison={`${kpis?.delivered_orders || 0} of ${kpis?.total_orders || 0} delivered`}
            variant="default"
            onClick={() => router.push("/dashboard/orders?status=delivered")}
          />
        </div>

        {/* Analytics Row - Real data from Supabase */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Order Activity (Last 7 Days) */}
          <ChartCard
            title="Daily Order Activity"
            icon={<TrendingUp className="h-5 w-5" />}
            className="lg:col-span-2"
          >
            <DemandFlowChart data={dailyActivity} />
          </ChartCard>

          {/* Top Kalamkari Categories - From real sales data */}
          <ChartCard
            title="Top Kalamkari Categories"
            icon={<BarChart3 className="h-5 w-5" />}
          >
            {categories.length > 0 ? (
              <CategoryBarChart data={categories} />
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-gray-400">
                No category sales data yet
              </div>
            )}
          </ChartCard>
        </div>

        {/* Tables Section - Already using real data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pb-8">
          <DataTable
            title="Recent Orders"
            icon={<ShoppingBag className="h-5 w-5" />}
            columns={orderColumns}
            data={recentOrders}
            onRowClick={(order) =>
              router.push(`/dashboard/orders/${order.id}`)
            }
            emptyState={{
              icon: <ShoppingBag className="h-12 w-12" />,
              message: "No recent orders",
            }}
          />

          <DataTable
            title="Top Products"
            icon={<Package className="h-5 w-5" />}
            columns={productColumns}
            data={topProducts}
            onRowClick={(product) =>
              router.push(`/dashboard/products/${product.id}`)
            }
            emptyState={{
              icon: <Package className="h-12 w-12" />,
              message: "No product data",
            }}
          />
        </div>
      </div>
    </div>
  );
}
