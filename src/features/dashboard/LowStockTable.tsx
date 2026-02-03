"use client";

import { DataTable } from "@/features/dashboard/DataTable";
import { Badge } from "@/shared/ui/badge";

const columns = [
  { label: "Product Name", key: "name" },
  { label: "SKU", key: "sku" },
  { 
      label: "Stock Level", 
      key: "stock",
      render: (item: any) => <span className="text-red-600 font-bold">{item.stock} left</span>
  },
  { 
      label: "Status", 
      key: "status",
      render: (item: any) => <Badge variant="destructive" className="uppercase text-[10px] shadow-none">Restock</Badge>
  }
];

const mockData = [
  { name: "Indigo Vine Cotton Saree", sku: "KLM-COT-089", stock: 2, status: "Low Stock" },
  { name: "Annapakshi Motif Silk", sku: "KLM-SLK-112", stock: 1, status: "Critical" },
  { name: "Tree of Life Wall Hanging", sku: "KLM-ART-045", stock: 3, status: "Low Stock" },
];

export function LowStockTable() {
    return (
        <DataTable 
            title="Low Stock Alerts"
            actions={<span className="text-xs font-medium text-rose-500 cursor-pointer hover:text-rose-700">Manage Inventory</span>}
            columns={columns} 
            data={mockData} 
        />
    );
}
