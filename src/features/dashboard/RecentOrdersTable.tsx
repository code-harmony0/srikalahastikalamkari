"use client";

import { DataTable } from "@/features/dashboard/DataTable";
import { Badge } from "@/shared/ui/badge";

const columns = [
  { label: "Order ID", key: "id" },
  { label: "Customer", key: "customer" },
  { label: "Product", key: "product" },
  { label: "Date", key: "date" },
  { label: "Amount", key: "amount" },
  { 
    label: "Status", 
    key: "status",
    render: (item: any) => {
        const value = item.status;
        const color = 
            value === "Delivered" ? "bg-emerald-100 text-emerald-800" : 
            value === "Processing" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800";
        return <Badge className={`uppercase text-[10px] shadow-none ${color}`}>{value}</Badge>
    }
  },
];

const mockData = [
  { id: "#ORD-7234", customer: "Priya S.", product: "Peacock Motif Saree", date: "2 mins ago", amount: "₹12,450", status: "Processing" },
  { id: "#ORD-7233", customer: "Anjali M.", product: "Natural Dye Fabric", date: "1 hour ago", amount: "₹4,200", status: "Delivered" },
  { id: "#ORD-7232", customer: "Rahul K.", product: "Temple Border Silk", date: "3 hours ago", amount: "₹18,900", status: "Processing" },
  { id: "#ORD-7231", customer: "Sarah J.", product: "Kalamkari Dupatta", date: "5 hours ago", amount: "₹3,500", status: "Delivered" },
];

export function RecentOrdersTable() {
    return (
        <DataTable 
            title="Recent Orders"
            actions={<span className="text-xs font-medium text-slate-500 cursor-pointer hover:text-slate-800">View All</span>}
            columns={columns} 
            data={mockData} 
        />
    );
}
