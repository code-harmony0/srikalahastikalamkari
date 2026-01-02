"use client";

import { useState } from "react";
import { User, Mail, Phone, MapPin, Package, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import Link from "next/link";

export default function ProfilePage() {
  const [user] = useState({
    name: "Guest User",
    email: "guest@example.com",
    phone: "+91 XXXXX XXXXX",
    address: "123 Street, City, State, PIN"
  });

  const recentOrders = [
    {
      id: "ORD-001",
      date: "2025-12-20",
      total: 12999,
      status: "Delivered",
      items: 2
    },
    {
      id: "ORD-002",
      date: "2025-12-15",
      total: 8999,
      status: "In Transit",
      items: 1
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-background/30 to-secondary/10 border-b border-gray-200 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="flex items-center gap-4">
            <User className="w-10 h-10 md:w-12 md:h-12 text-primary" />
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground">My Profile</h1>
          </div>
          <p className="text-base md:text-lg text-foreground/70 font-paragraph mt-3">Manage your account and orders</p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-amber-700" />
                </div>
                <h2 className="text-xl font-semibold mb-2">{user.name}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardContent className="p-6 space-y-2">
                <Link href="/profile/orders">
                  <Button variant="ghost" className="w-full justify-start">
                    <Package className="mr-2 w-4 h-4" />
                    My Orders
                  </Button>
                </Link>
                <Link href="/wishlist">
                  <Button variant="ghost" className="w-full justify-start">
                    <Heart className="mr-2 w-4 h-4" />
                    Wishlist
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{user.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{user.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">{user.address}</p>
                    </div>
                  </div>
                </div>
                <Button variant="outline">Edit Profile</Button>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-semibold">{order.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.date).toLocaleDateString()} • {order.items} items
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{order.total.toLocaleString()}</p>
                        <p className={`text-sm ${
                          order.status === 'Delivered' ? 'text-green-600' : 'text-amber-600'
                        }`}>
                          {order.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Orders
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
