"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  Settings,
  Database,
  FileText,
  Home,
  Tag,
  Star
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";

export default function DashboardPage() {
  // Mock stats - replace with real Supabase data later
  const stats = [
    {
      title: "Total Products",
      value: "0",
      icon: Package,
      change: "+0%",
      trend: "up"
    },
    {
      title: "Total Orders",
      value: "0",
      icon: ShoppingCart,
      change: "+0%",
      trend: "up"
    },
    {
      title: "Total Customers",
      value: "0",
      icon: Users,
      change: "+0%",
      trend: "up"
    },
    {
      title: "Revenue",
      value: "₹0",
      icon: DollarSign,
      change: "+0%",
      trend: "up"
    }
  ];

  const quickActions = [
    {
      title: "Manage Products",
      description: "Add, edit, or remove products from your catalog",
      icon: Package,
      href: "/dashboard/products",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "View Orders",
      description: "Track and manage customer orders",
      icon: ShoppingCart,
      href: "/dashboard/orders",
      color: "from-green-500 to-green-600"
    },
    {
      title: "Categories",
      description: "Organize your products into categories",
      icon: Tag,
      href: "/dashboard/categories",
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Promotions",
      description: "Create and manage promotional banners",
      icon: Star,
      href: "/dashboard/promotions",
      color: "from-orange-500 to-orange-600"
    },
    {
      title: "Database Setup",
      description: "Run migrations and setup your database",
      icon: Database,
      href: "#setup",
      color: "from-red-500 to-red-600"
    },
    {
      title: "Site Settings",
      description: "Configure site-wide settings",
      icon: Settings,
      href: "/dashboard/settings",
      color: "from-gray-600 to-gray-700"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-background/30 to-secondary/10 border-b border-gray-200 py-12 md:py-16">
        <div className="max-w-[100rem] mx-auto px-4 md:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Settings className="w-10 h-10 md:w-12 md:h-12 text-primary" />
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground">
                  Admin Dashboard
                </h1>
              </div>
              <p className="text-base md:text-lg text-foreground/70 font-paragraph max-w-2xl">
                Manage your Kalamkari store, products, and orders from one central location.
              </p>
            </div>
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Home className="w-5 h-5 mr-2" />
                Back to Store
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-12 md:py-16">
        <div className="max-w-[100rem] mx-auto px-4 md:px-8">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-8">
            Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="border border-gray-200 hover:shadow-md transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-paragraph font-medium text-foreground/70">
                        {stat.title}
                      </CardTitle>
                      <Icon className="w-5 h-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end justify-between">
                        <div className="text-3xl font-heading font-bold text-foreground">
                          {stat.value}
                        </div>
                        <div className={`flex items-center gap-1 text-sm font-paragraph ${
                          stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <TrendingUp className="w-4 h-4" />
                          {stat.change}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-secondary/8 via-background to-secondary/5">
        <div className="max-w-[100rem] mx-auto px-4 md:px-8">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-8">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -4 }}
                >
                  <Link href={action.href}>
                    <Card className="h-full border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-primary/20 cursor-pointer group">
                      <CardContent className="p-6">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-heading font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                          {action.title}
                        </h3>
                        <p className="text-foreground/70 font-paragraph text-sm">
                          {action.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Setup Instructions */}
      <section id="setup" className="py-12 md:py-16">
        <div className="max-w-[100rem] mx-auto px-4 md:px-8">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-white to-secondary/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Database className="w-8 h-8 text-primary" />
                <CardTitle className="text-2xl font-heading font-bold text-foreground">
                  Database Setup Instructions
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 font-paragraph">
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">1. Create a Supabase Project</h4>
                <p className="text-foreground/70">
                  Go to <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">app.supabase.com</a> and create a new project.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">2. Run Database Migration</h4>
                <p className="text-foreground/70">
                  Copy the SQL from <code className="bg-gray-200 px-2 py-1 rounded">supabase/migrations/001_initial_schema.sql</code> and run it in your Supabase SQL editor.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">3. Set Environment Variables</h4>
                <p className="text-foreground/70">
                  Copy <code className="bg-gray-200 px-2 py-1 rounded">.env.local.example</code> to <code className="bg-gray-200 px-2 py-1 rounded">.env.local</code> and add your Supabase credentials.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">4. Generate TypeScript Types</h4>
                <p className="text-foreground/70">
                  Run: <code className="bg-gray-200 px-2 py-1 rounded">npx supabase gen types typescript --linked {">"} src/lib/supabase/types.ts</code>
                </p>
              </div>

              <div className="pt-4">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <FileText className="w-5 h-5 mr-2" />
                  View Full Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
