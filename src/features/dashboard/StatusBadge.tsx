"use client";

import * as React from "react";
import { cn } from "@/shared/utils";

/**
 * Status Badge Component
 * 
 * Color-coded pill-shaped badges for status indicators in tables.
 * 
 * Specifications:
 * - Pill shape (4px 12px padding, 12px radius)
 * - Font size: 12px, weight: 600
 * - Color mapping: success (green), info (blue), warning (yellow), danger (red)
 */

export type StatusType = "success" | "info" | "warning" | "danger" | "neutral" | "processing" | "pending";

export interface StatusBadgeProps {
  status: StatusType;
  label: string;
  className?: string;
}

const statusStyles: Record<StatusType, string> = {
  success: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
  info: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  warning: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
  danger: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  neutral: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
  processing: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  pending: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold",
        statusStyles[status],
        className
      )}
    >
      {label}
    </span>
  );
}
