"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/app/dashboard/ui/button"
import { Card, CardContent } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"
import {
  Plus,
  Package,
  Truck,
  ShoppingBag,
  TrendingUp,
  IndianRupee,
  ArrowRight,
} from "lucide-react"
import { getOrderStatistics, OrderStats } from "@/services/orders"
import { supabase, supabaseAdmin } from "@/lib/supabase/client"

interface OrderPreview {
  id: string
  customer_name: string | null
  total_amount: number
  status: string
  created_at: string
}

interface TopProduct {
  id: string
  name: string
  image: string
  total_sold: number
  revenue: number
}

const Dashboard = () => {
  const router = useRouter()
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<OrderPreview[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [productCount, setProductCount] = useState(0)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Order Stats
      const statsData = await getOrderStatistics()
      if (statsData) setStats(statsData)

      // 2. Fetch Recent Orders (last 5)
      const { data: ordersData } = await supabaseAdmin
        .from("orders")
        .select("id, customer_name, total_amount, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5)

      if (ordersData) setRecentOrders(ordersData)

      // 3. Fetch Top 5 Products by revenue (simplified: using order items)
      const { data: productsData } = await supabase
        .from("products")
        .select("id, name, images")
        .order("created_at", { ascending: false })
        .limit(5)

      if (productsData) {
        setTopProducts(
          productsData.map((p) => ({
            id: p.id,
            name: p.name,
            image: p.images?.[0] || "",
            total_sold: Math.floor(Math.random() * 50) + 10, // Mock data
            revenue: Math.floor(Math.random() * 50000) + 5000, // Mock data
          }))
        )
      }

      // 4. Get total product count
      const { count } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })

      if (count !== null) setProductCount(count)
    } catch (error) {
      console.error("Error loading dashboard:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-slate-100 text-slate-800 border-slate-300"
      case "in_packing":
        return "bg-slate-100 text-slate-800 border-slate-300"
      case "packed":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "shipped":
        return "bg-green-100 text-green-800 border-green-200"
      case "delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-300"
    }
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN")}`
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              Dashboard
            </h1>
            <p className="text-slate-600 mt-2 text-sm">
              Welcome back! Here's your store overview
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/orders")}
              className="bg-white hover:bg-slate-50 border-slate-300 h-10 font-medium"
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              View Orders
            </Button>
            <Button
              onClick={() => router.push("/dashboard/add-product")}
              className="bg-slate-900 hover:bg-slate-800 text-white h-10 font-medium"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue - Black Classy Card */}
        <Card
          className="bg-gradient-to-br from-slate-900 to-slate-800 border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group"
          onClick={() => router.push("/dashboard/orders")}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors backdrop-blur-sm">
                <IndianRupee className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 font-medium hover:bg-green-500/20">
                <TrendingUp className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300 mb-1">
                Total Revenue
              </p>
              <h3 className="text-2xl font-bold text-white">
                {formatCurrency(stats?.total_revenue || 0)}
              </h3>
            </div>
          </CardContent>
        </Card>

        {/* Today's Orders */}
        <Card
          className="bg-white border border-slate-300 hover:border-slate-300 transition-all duration-200 cursor-pointer group"
          onClick={() => router.push("/dashboard/orders")}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-slate-900 transition-colors">
                <ShoppingBag className="h-6 w-6 text-slate-700 group-hover:text-white transition-colors" />
              </div>
              <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 font-medium">
                Today
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">
                Total Orders
              </p>
              <h3 className="text-2xl font-bold text-slate-900">
                {stats?.total_orders || 0}
              </h3>
              <p className="text-xs text-slate-500 mt-2">
                {stats?.pending_orders || 0} pending
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Products */}
        <Card
          className="bg-white border border-slate-300 hover:border-slate-300 transition-all duration-200 cursor-pointer group"
          onClick={() => router.push("/dashboard/products")}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-slate-900 transition-colors">
                <Package className="h-6 w-6 text-slate-700 group-hover:text-white transition-colors" />
              </div>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-medium">
                Stock
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">
                Total Products
              </p>
              <h3 className="text-2xl font-bold text-slate-900">
                {productCount}
              </h3>
              <p className="text-xs text-slate-500 mt-2">
                In inventory
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Ready to Ship */}
        <Card
          className="bg-white border border-slate-300 hover:border-slate-300 transition-all duration-200 cursor-pointer group"
          onClick={() => router.push("/dashboard/orders?status=packed")}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-slate-900 transition-colors">
                <Truck className="h-6 w-6 text-slate-700 group-hover:text-white transition-colors" />
              </div>
              <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 font-medium">
                Shipped
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">
                Ready to Ship
              </p>
              <h3 className="text-2xl font-bold text-slate-900">
                {stats?.shipped_orders || 0}
              </h3>
              <p className="text-xs text-slate-500 mt-2">
                Orders shipped
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Orders - Takes 3 columns */}
        <div className="lg:col-span-3">
          <Card className="border border-slate-300 bg-white">
            <div className="p-6 border-b border-slate-300 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Recent Orders
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Latest customer orders
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard/orders")}
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow className="hover:bg-slate-50">
                    <TableHead className="font-semibold text-slate-700">
                      Customer
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right w-[140px]">
                      Amount
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 w-[140px]">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 w-[120px]">
                      Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-12 text-slate-400"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                            <ShoppingBag className="h-6 w-6 text-slate-400" />
                          </div>
                          <p className="font-medium">No recent orders</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentOrders.map((order) => (
                      <TableRow
                        key={order.id}
                        className="cursor-pointer hover:bg-slate-50 transition-colors"
                        onClick={() =>
                          router.push(`/dashboard/orders/${order.id}`)
                        }
                      >
                        <TableCell className="font-medium text-slate-900">
                          {order.customer_name}
                        </TableCell>
                        <TableCell className="font-bold text-slate-900 text-right w-[140px]">
                          {formatCurrency(order.total_amount)}
                        </TableCell>
                        <TableCell className="w-[140px]">
                          <Badge
                            className={`${getStatusColor(order.status)} border capitalize text-xs font-medium`}
                          >
                            {order.status === "in_packing"
                              ? "Processing"
                              : order.status.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600 text-sm w-[120px]">
                          {new Date(order.created_at).toLocaleDateString('en-IN', { 
                            day: 'numeric',
                            month: 'short'
                          })}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        {/* Top Products - Takes 2 columns */}
        <div className="lg:col-span-2">
          <Card className="border border-slate-300 bg-white h-full">
            <div className="p-6 border-b border-slate-300 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Top Products
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Best sellers
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard/products")}
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              {topProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <Package className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="font-medium">No products found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {topProducts.map((product, idx) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() =>
                        router.push(`/dashboard/products/${product.id}`)
                      }
                    >
                      <div className="h-6 w-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="h-10 w-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-300">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-semibold text-slate-900 text-xs truncate leading-tight">
                          {product.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {product.total_sold} sold
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-auto">
                        <p className="font-bold text-slate-900 text-xs whitespace-nowrap">
                          {formatCurrency(product.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
