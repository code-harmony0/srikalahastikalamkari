"use client";

import { AlertTriangle, Package, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";

interface DashboardAlertsProps {
  lowStockCount: number;
  pendingOrdersCount: number;
}

export function DashboardAlerts({ lowStockCount, pendingOrdersCount }: DashboardAlertsProps) {
  const router = useRouter();

  if (lowStockCount === 0 && pendingOrdersCount === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {pendingOrdersCount > 0 && (
        <div 
          onClick={() => router.push("/dashboard/orders?status=pending")}
          className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-lg p-4 flex items-start gap-3 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors"
        >
          <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full shrink-0">
            <ShoppingBag className="w-5 h-5 text-amber-600 dark:text-amber-500" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-900 dark:text-amber-400 text-sm">
              Action Required
            </h3>
            <p className="text-amber-800/80 dark:text-amber-500/80 text-xs mt-1">
              You have <span className="font-bold">{pendingOrdersCount} new orders</span> waiting to be processed.
            </p>
          </div>
        </div>
      )}

      {lowStockCount > 0 && (
        <div 
          onClick={() => router.push("/dashboard/products?filter=low_stock")}
          className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg p-4 flex items-start gap-3 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
        >
          <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-400 text-sm">
              Inventory Alert
            </h3>
            <p className="text-red-800/80 dark:text-red-500/80 text-xs mt-1">
              <span className="font-bold">{lowStockCount} items</span> are running low on stock.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
