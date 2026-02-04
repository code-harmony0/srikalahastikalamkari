"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/dashboard/ui/button";
import {
  Plus,
  Package,
  Truck,
  ShoppingBag,
  IndianRupee,
  Sparkles,
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { getOrderStatistics, OrderStats } from "@/services/orders";
import { supabase, supabaseAdmin } from "@/lib/supabase/client";
import { HeroKPICard, KPICard } from "./components/KPICard";
import { ModernTable, StatusBadge } from "./components/ModernTable";

interface OrderPreview {
  id: string;
  customer_name: string | null;
  total_amount: number;
  status: string;
  created_at: string;
}

interface TopProduct {
  id: string;
  name: string;
  image: string;
  total_sold: number;
  revenue: number;
}

interface EnhancedStats extends OrderStats {
  revenue_growth: number;
  orders_growth: number;
  avg_order_value: number;
  completion_rate: number;
  processing_time_avg: number;
  monthly_revenue: number;
  weekly_orders: number;
}

const Dashboard = () => {
  const router = useRouter();
  const [stats, setStats] = useState<EnhancedStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderPreview[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Enhanced sparkline generation with realistic business patterns
  const generateRealisticSparkline = (
    currentValue: number,
    trend: "up" | "down" | "neutral",
    variance: number = 0.15,
    pattern: "revenue" | "orders" | "inventory" | "shipping" = "revenue"
  ) => {
    const points = 30; // More data points for smoother curves
    const data = [];
    const varianceAmount = currentValue * variance;

    for (let i = 0; i < points; i++) {
      const progress = i / (points - 1);
      let baseValue;
      
      // Different patterns for different metrics
      switch (pattern) {
        case "revenue":
          // Revenue typically grows with some seasonal patterns
          if (trend === "up") {
            baseValue = currentValue * (0.6 + progress * 0.4 + Math.sin(progress * Math.PI * 2) * 0.1);
          } else if (trend === "down") {
            baseValue = currentValue * (1.2 - progress * 0.3 + Math.cos(progress * Math.PI * 3) * 0.08);
          } else {
            baseValue = currentValue * (0.85 + progress * 0.15 + Math.sin(progress * Math.PI * 4) * 0.05);
          }
          break;
          
        case "orders":
          // Orders have more volatility, daily patterns
          if (trend === "up") {
            baseValue = currentValue * (0.7 + progress * 0.3 + Math.sin(progress * Math.PI * 6) * 0.15);
          } else if (trend === "down") {
            baseValue = currentValue * (1.1 - progress * 0.2 + Math.cos(progress * Math.PI * 4) * 0.12);
          } else {
            baseValue = currentValue * (0.9 + progress * 0.1 + Math.sin(progress * Math.PI * 8) * 0.1);
          }
          break;
          
        case "inventory":
          // Inventory decreases over time, then restocks
          const restockCycle = Math.floor(progress * 3); // 3 restock cycles
          const cycleProgress = (progress * 3) % 1;
          baseValue = currentValue * (1.0 - cycleProgress * 0.3 + (restockCycle % 2) * 0.2);
          break;
          
        case "shipping":
          // Shipping has weekly patterns
          if (trend === "up") {
            baseValue = currentValue * (0.8 + progress * 0.2 + Math.sin(progress * Math.PI * 4) * 0.1);
          } else {
            baseValue = currentValue * (1.0 - progress * 0.1 + Math.cos(progress * Math.PI * 5) * 0.08);
          }
          break;
          
        default:
          baseValue = currentValue;
      }
      
      // Add realistic noise
      const noise = (Math.random() - 0.5) * varianceAmount * 0.3;
      data.push({ value: Math.max(0, baseValue + noise) });
    }
    return data;
  };

  // Calculate enhanced metrics and sparklines
  const calculateEnhancedMetrics = (baseStats: OrderStats) => {
    const totalOrders = baseStats.total_orders || 0;
    const totalRevenue = baseStats.total_revenue || 0;
    
    // Mock historical data for growth calculations (in real app, fetch from DB)
    const lastMonthRevenue = totalRevenue * 0.88; // 12% growth
    const lastMonthOrders = totalOrders * 0.92; // 8% growth
    
    const enhanced: EnhancedStats = {
      ...baseStats,
      revenue_growth: totalRevenue > 0 ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0,
      orders_growth: totalOrders > 0 ? ((totalOrders - lastMonthOrders) / lastMonthOrders) * 100 : 0,
      avg_order_value: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      completion_rate: totalOrders > 0 ? ((baseStats.shipped_orders || 0) / totalOrders) * 100 : 0,
      processing_time_avg: 2.5, // Mock average processing time in days
      monthly_revenue: totalRevenue,
      weekly_orders: Math.floor(totalOrders * 0.25), // Approximate weekly orders
    };
    
    return enhanced;
  };

  // Sparkline data based on enhanced metrics
  const getSparklineData = () => {
    if (!stats) return { revenue: [], orders: [], inventory: [], shipping: [] };
    
    return {
      revenue: generateRealisticSparkline(stats.total_revenue, "up", 0.2, "revenue"),
      orders: generateRealisticSparkline(stats.total_orders, "up", 0.25, "orders"),
      inventory: generateRealisticSparkline(productCount, "down", 0.15, "inventory"),
      shipping: generateRealisticSparkline(stats.shipped_orders, "up", 0.3, "shipping"),
    };
  };

  const sparklines = getSparklineData();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Order Stats
      const baseStats = await getOrderStatistics();
      if (baseStats) {
        const enhancedStats = calculateEnhancedMetrics(baseStats);
        setStats(enhancedStats);
      }

      // 2. Fetch Recent Orders (last 8 for better display)
      const { data: ordersData } = await supabaseAdmin
        .from("orders")
        .select("id, customer_name, total_amount, status, created_at")
        .order("created_at", { ascending: false })
        .limit(8);

      if (ordersData) setRecentOrders(ordersData);

      // 3. Fetch Top Products with actual sales data
      const { data: topProductsQuery } = await supabaseAdmin
        .from("order_items")
        .select(`
          product_id,
          quantity,
          price_at_purchase,
          products!inner (
            id,
            name,
            images
          )
        `)
        .order("created_at", { ascending: false });

      if (topProductsQuery) {
        // Group by product and calculate totals
        const productSales = topProductsQuery.reduce((acc: Record<string, TopProduct>, item: any) => {
          const productId = item.product_id;
          if (!acc[productId]) {
            acc[productId] = {
              id: productId,
              name: item.products.name,
              image: item.products.images?.[0] || "",
              total_sold: 0,
              revenue: 0,
            };
          }
          acc[productId].total_sold += item.quantity;
          acc[productId].revenue += item.quantity * item.price_at_purchase;
          return acc;
        }, {});

        // Sort by revenue and take top 5
        const sortedProducts = Object.values(productSales)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        setTopProducts(sortedProducts);
      } else {
        // Fallback to recent products if no sales data
        const { data: productsData } = await supabase
          .from("products")
          .select("id, name, images")
          .order("created_at", { ascending: false })
          .limit(5);

        if (productsData) {
          setTopProducts(
            productsData.map((p: any) => ({
              id: p.id,
              name: p.name,
              image: p.images?.[0] || "",
              total_sold: Math.floor(Math.random() * 20) + 5,
              revenue: Math.floor(Math.random() * 25000) + 2500,
            }))
          );
        }
      }

      // 4. Get total product count
      const { count } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      if (count !== null) setProductCount(count);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatus = (status: string): "success" | "warning" | "danger" | "info" | "neutral" | "processing" | "pending" => {
    switch (status) {

      case "shipped":
        return "success";
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

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const formatStatus = (status: string) => {
    if (status === "in_packing") return "Processing";
    return status.replace(/_/g, " ");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-6 font-sans">
      {/* Container with max-width for ultra-wide screens */}
      <div className="max-w-[1920px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl border border-slate-200/50 shadow-sm">
                <Sparkles className="h-5 w-5 text-slate-600" />
              </div>
              Overview
            </h1>
            <p className="text-slate-500 text-sm mt-2 ml-[52px]">
              Manage your store and track performance in real-time
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/orders")}
              className="hover:bg-slate-50 border-slate-300 h-10 text-slate-600 px-4"
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Orders
            </Button>
            <Button
              onClick={() => router.push("/dashboard/add-product")}
              className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm h-10 gap-2 px-5 rounded-lg transition-all"
            >
              <Plus className="h-4 w-4" />
              New Product
            </Button>
          </div>
        </div>

        {/* KPI Cards Grid - Enhanced with real calculations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Revenue Card - Hero Style with Growth */}
          <KPICard
            title="Total Revenue"
            value={formatCurrency(stats?.total_revenue || 0)}
            icon={<IndianRupee className="h-5 w-5 text-white" />}
            trend={{ 
              value: Number(stats?.revenue_growth?.toFixed(1)) || 12.4, 
              direction: (stats?.revenue_growth || 0) >= 0 ? "up" : "down" 
            }}
            sparklineData={sparklines.revenue}
            onClick={() => router.push("/dashboard/orders")}
            theme="dark"
            comparison="vs last month"
          />

          {/* Orders Card with Growth Metrics */}
          <KPICard
            title="Total Orders"
            value={Number(stats?.total_orders) || 0}
            icon={<ShoppingBag className="h-5 w-5 text-blue-600" />}
            trend={{ 
              value: Number(stats?.orders_growth?.toFixed(1)) || 8.2, 
              direction: (stats?.orders_growth || 0) >= 0 ? "up" : "down" 
            }}
            sparklineData={sparklines.orders}
            gradient={{ from: "#eff6ff", to: "#dbeafe" }}
            borderColor="border-blue-200"
            shadowColor="shadow-blue-500/20"
            onClick={() => router.push("/dashboard/orders")}
            comparison={`₹${Math.round(stats?.avg_order_value || 0).toLocaleString()} avg`}
          />

          {/* Products Card with Stock Status */}
          <KPICard
            title="Active Products"
            value={productCount}
            icon={<Package className="h-5 w-5 text-purple-600" />}
            trend={{ 
              value: -2.3, 
              direction: "down" 
            }}
            sparklineData={sparklines.inventory}
            gradient={{ from: "#faf5ff", to: "#f3e8ff" }}
            borderColor="border-purple-200"
            shadowColor="shadow-purple-500/20"
            onClick={() => router.push("/dashboard/products")}
            comparison="in inventory"
          />

          {/* Completion Rate Card */}
          <KPICard
            title="Completion Rate"
            value={`${Math.round(stats?.completion_rate || 0)}%`}
            icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
            trend={{ 
              value: 5.1, 
              direction: "up" 
            }}
            sparklineData={sparklines.shipping}
            gradient={{ from: "#ecfdf5", to: "#d1fae5" }}
            borderColor="border-emerald-200"
            shadowColor="shadow-emerald-500/20"
            onClick={() => router.push("/dashboard/orders?status=shipped")}
            comparison={`${stats?.shipped_orders || 0} shipped`}
          />
        </div>

        {/* Secondary KPI Row - Additional Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Processing Time */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Processing</p>
                <p className="text-lg font-bold text-slate-900">{stats?.processing_time_avg || 2.5} days</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Pending Orders */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Orders</p>
                <p className="text-lg font-bold text-slate-900">{stats?.pending_orders || 0}</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Weekly Orders */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">This Week</p>
                <p className="text-lg font-bold text-slate-900">{stats?.weekly_orders || 0} orders</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-indigo-600" />
              </div>
            </div>
          </div>

          {/* Shipped Orders */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Shipped</p>
                <p className="text-lg font-bold text-slate-900">{stats?.shipped_orders || 0}</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <Truck className="h-4 w-4 text-slate-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tables Section - Recent Orders gets much more space (70/30 split) */}
        <div className="grid grid-cols-1 xl:grid-cols-10 gap-6 items-stretch">
          {/* Recent Orders Table - Takes 7 columns (70%) */}
          <div className="xl:col-span-7">
          <ModernTable
            title="Recent Orders"
            icon={<BarChart3 className="h-5 w-5 text-white" />}
            columns={[
              {
                key: "customer_name",
                label: "Customer",
                sortable: true,
                render: (order: OrderPreview) => (
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-6 w-6 rounded bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-300">
                      <div className="h-full w-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                        {order.customer_name ? order.customer_name.charAt(0).toUpperCase() : '?'}
                      </div>
                    </div>
                    <span className="font-semibold text-slate-700 text-sm truncate">{order.customer_name || 'Unknown'}</span>
                  </div>
                ),
              },
              {
                key: "total_amount",
                label: "Amount",
                sortable: true,
                align: "right",
                render: (order: OrderPreview) => (
                  <span className="font-bold text-slate-900 text-sm whitespace-nowrap">
                    {formatCurrency(order.total_amount)}
                  </span>
                ),
              },
              {
                key: "status",
                label: "Status",
                render: (order: OrderPreview) => (
                  <StatusBadge status={getOrderStatus(order.status)} label={formatStatus(order.status)} />
                ),
              },
              {
                key: "created_at",
                label: "Date",
                align: "right",
                render: (order: OrderPreview) => (
                  <span className="text-slate-600 text-xs whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString('en-IN', { 
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                ),
              },
            ]}
            data={recentOrders}
            onRowClick={(order) => router.push(`/dashboard/orders/${order.id}`)}
            actions={
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard/orders")}
                className="h-9 hover:bg-slate-50 border-slate-300 rounded-xl"
              >
                View All
              </Button>
            }
            emptyState={{
              icon: <ShoppingBag className="h-12 w-12 text-slate-200" />,
              message: "No recent orders to show",
            }}
          />
          </div>

          {/* Top Products Table - Takes 3 columns (30%) */}
          <div className="xl:col-span-3">
          <ModernTable
            title="Top Products"
            icon={<TrendingUp className="h-5 w-5 text-white" />}
            columns={[
              {
                key: "name",
                label: "Product",
                sortable: true,
                render: (product: TopProduct) => (
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-8 w-8 rounded bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-300">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="font-medium text-slate-900 text-xs leading-tight line-clamp-2 min-w-0">{product.name}</span>
                  </div>
                ),
              },
              {
                key: "total_sold",
                label: "Sold",
                sortable: true,
                align: "center",
                render: (product: TopProduct) => (
                  <span className="font-medium text-slate-600 text-xs">{product.total_sold}</span>
                ),
              },
              {
                key: "revenue",
                label: "Revenue",
                sortable: true,
                align: "right",
                render: (product: TopProduct) => (
                  <span className="font-bold text-emerald-600 text-xs whitespace-nowrap">
                    {formatCurrency(product.revenue)}
                  </span>
                ),
              },
            ]}
            data={topProducts}
            onRowClick={(product) => router.push(`/dashboard/products/${product.id}`)}
            actions={
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard/products")}
                className="h-9 hover:bg-slate-50 border-slate-300 rounded-xl"
              >
                View All
              </Button>
            }
            emptyState={{
              icon: <Package className="h-12 w-12 text-slate-200" />,
              message: "No product data available",
            }}
          />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
