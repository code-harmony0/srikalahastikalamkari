"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Card } from "@/shared/ui/card";
import { Button } from "@/app/dashboard/ui/button";
import { Badge } from "@/shared/ui/badge";
import { ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type SortDirection = "asc" | "desc" | null;
type RowDensity = "compact" | "default" | "comfortable";

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  align?: "left" | "center" | "right";
}

interface ModernTableProps<T> {
  columns: Column<T>[];
  data: T[];
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onRowClick?: (item: T) => void;
  actions?: React.ReactNode;
  emptyState?: {
    icon: React.ReactNode;
    message: string;
  };
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export function ModernTable<T extends Record<string, any>>({
  columns,
  data,
  title,
  subtitle,
  icon,
  onRowClick,
  actions,
  emptyState,
  collapsible = false,
  defaultCollapsed = false,
}: ModernTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: SortDirection;
  }>({ key: "", direction: null });
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const handleSort = (key: string) => {
    let direction: SortDirection = "asc";

    if (sortConfig.key === key) {
      if (sortConfig.direction === "asc") direction = "desc";
      else if (sortConfig.direction === "desc") direction = null;
    }

    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.direction || !sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const getSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="h-4 w-4 opacity-40" />;
    }
    if (sortConfig.direction === "asc") {
      return <ArrowUp className="h-4 w-4 text-slate-900" />;
    }
    if (sortConfig.direction === "desc") {
      return <ArrowDown className="h-4 w-4 text-slate-900" />;
    }
    return <ArrowUpDown className="h-4 w-4 opacity-40" />;
  };

  return (
    <Card className="border border-slate-300 shadow-sm hover:shadow-md transition-all duration-300 bg-white overflow-hidden rounded-xl h-full flex flex-col">
      {/* Header - Aligned baseline */}
      {(title || actions) && (
        <div className="px-3 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="h-9 w-9 rounded-lg bg-slate-900 flex items-center justify-center shrink-0 [&_svg]:text-white [&_svg]:h-4 [&_svg]:w-4">
                {icon}
              </div>
            )}
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          </div>

          <div className="flex items-center gap-2">
            {actions}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <Table className="w-full">
          <TableHeader className="bg-slate-50/80">
            <TableRow className="hover:bg-transparent border-b border-slate-300">
              {columns.map((column, colIndex) => {
                // Content-based width allocation - let content determine size
                let widthClass = "";
                if (column.key.includes("name") || column.key.includes("customer") || column.key.includes("product")) {
                  widthClass = "max-w-none"; // Let name/product content expand as needed
                } else if (column.key.includes("status")) {
                  widthClass = "w-1"; // Minimal width, let badge content determine size
                } else if (column.key.includes("date") || column.key.includes("created")) {
                  widthClass = "w-1"; // Minimal width for compact dates
                } else if (column.key.includes("amount") || column.key.includes("revenue") || column.key.includes("price")) {
                  widthClass = "w-1"; // Let currency values determine width
                } else if (column.key.includes("sold") || column.key.includes("quantity") || column.key.includes("count")) {
                  widthClass = "w-8"; // Very small fixed width for sold numbers
                } else {
                  widthClass = "w-1"; // Minimal default - content determines actual width
                }

                return (
                  <TableHead
                    key={column.key}
                    className={`font-semibold text-xs uppercase tracking-wider text-slate-500 py-2 px-1 ${widthClass} ${
                      column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : "text-left"
                    } ${column.sortable ? "cursor-pointer select-none hover:text-slate-700 transition-colors" : ""}`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div
                      className={`flex items-center gap-1 ${
                        column.align === "right" ? "justify-end" : column.align === "center" ? "justify-center" : ""
                      }`}
                    >
                      <span className="whitespace-nowrap">{column.label}</span>
                      {column.sortable && (
                        <div className={`flex-shrink-0 ${sortConfig.key === column.key ? "text-slate-700" : "opacity-50"}`}>
                          {getSortIcon(column.key)}
                        </div>
                      )}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-20">
                  {emptyState ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
                        <div className="text-slate-300 [&_svg]:h-8 [&_svg]:w-8">{emptyState.icon}</div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-600">{emptyState.message}</p>
                        <p className="text-xs text-slate-400">New items will appear here</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-slate-100" />
                      <p className="text-sm text-slate-400">No data available</p>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.slice(0, 5).map((item, idx) => (
                <TableRow
                  key={idx}
                  className={`group hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column, colIndex) => (
                    <TableCell
                      key={column.key}
                      className={`py-2 px-1 ${
                        column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : "text-left"
                      } text-sm text-slate-700`}
                    >
                      {column.render ? column.render(item) : item[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

// Enhanced Status Badge Component with distinct colors for each status
export function StatusBadge({
  status,
  label,
}: {
  status: "success" | "warning" | "danger" | "info" | "neutral" | "processing" | "pending";
  label: string;
}) {
  const statusStyles = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100",
    warning: "bg-amber-50 text-amber-700 border-amber-200 shadow-amber-100",
    danger: "bg-red-50 text-red-700 border-red-200 shadow-red-100",
    info: "bg-blue-50 text-blue-700 border-blue-200 shadow-blue-100",
    processing: "bg-purple-50 text-purple-700 border-purple-200 shadow-purple-100",
    pending: "bg-orange-50 text-orange-700 border-orange-200 shadow-orange-100",
    neutral: "bg-slate-50 text-slate-600 border-slate-200 shadow-slate-100",
  };

  const dotColors = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
    info: "bg-blue-500",
    processing: "bg-purple-500",
    pending: "bg-orange-500",
    neutral: "bg-slate-400",
  };

  const pulseAnimation = {
    processing: "animate-pulse",
    pending: "animate-pulse",
  };

  return (
    <div
      className={`${statusStyles[status]} border capitalize text-xs px-3 py-1.5 font-medium rounded-lg flex items-center gap-2 w-fit shadow-sm ${
        pulseAnimation[status as keyof typeof pulseAnimation] || ""
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${dotColors[status]} flex-shrink-0`} />
      <span className="whitespace-nowrap">{label}</span>
    </div>
  );
}
