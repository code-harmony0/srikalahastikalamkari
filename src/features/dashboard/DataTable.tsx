"use client"

import * as React from "react"
import { Card, CardHeader } from "@/shared/ui/card"
import { cn } from "@/shared/utils"

/**
 * Data Table Component
 *
 * Displays tabular data with visual subordination to KPI cards.
 *
 * Critical Constraints:
 * - Row height: 56px
 * - Cell padding: 12px
 * - Header font size: ≤14px (never exceed KPI label size)
 * - Borders: gray-200/gray-700 only (no stronger borders)
 * - Shadow: base only (same as KPI cards)
 * - Position: AFTER first scroll (not above-the-fold)
 */

export interface TableColumn<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  align?: "left" | "center" | "right"
  render?: (item: T) => React.ReactNode
}

export interface DataTableProps<T> {
  title: string
  icon?: React.ReactNode
  columns: TableColumn<T>[]
  data: T[]
  onRowClick?: (item: T) => void
  actions?: React.ReactNode
  emptyState?: {
    icon: React.ReactNode
    message: string
  }
  className?: string
}

export function DataTable<T extends Record<string, any>>({
  title,
  icon,
  columns,
  data,
  onRowClick,
  actions,
  emptyState,
  className,
}: DataTableProps<T>) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Header */}
      <CardHeader className="mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700">
              <div className="text-gray-600 dark:text-gray-400 w-5 h-5">
                {icon}
              </div>
            </div>
          )}
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        {actions && <div>{actions}</div>}
      </CardHeader>

      {/* Table */}
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full">
          {/* Table Header - sticky, max 14px font */}
          <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700">
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={cn(
                    "px-3 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider",
                    column.align === "center" && "text-center",
                    column.align === "right" && "text-right",
                    column.align !== "center" &&
                      column.align !== "right" &&
                      "text-left",
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center">
                  {emptyState ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-gray-400 dark:text-gray-600 w-12 h-12">
                        {emptyState.icon}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {emptyState.message}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No data available
                    </p>
                  )}
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    "border-b border-gray-200 dark:border-gray-700 h-14", // 56px row height
                    onRowClick &&
                      "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                  )}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={cn(
                        "px-3 py-3 text-sm text-gray-900 dark:text-white", // 12px cell padding
                        column.align === "center" && "text-center",
                        column.align === "right" && "text-right",
                      )}
                    >
                      {column.render
                        ? column.render(item)
                        : String(item[column.key as keyof T] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
