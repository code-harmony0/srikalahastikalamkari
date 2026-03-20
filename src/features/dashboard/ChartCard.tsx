"use client";

import * as React from "react";
import { Card, CardHeader } from "./Card";
import { cn } from "@/shared/utils";

/**
 * Chart Card Component
 * 
 * Wrapper for chart visualizations with visual subordination to KPI cards.
 * 
 * Critical Constraints:
 * - Maximum height: 320px (strict)
 * - Padding: 20px (inherited from Card)
 * - Border radius: 14px (inherited from Card)
 * - Softer colors and lighter borders for visual subordination
 */

export interface ChartCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  icon,
  children,
  actions,
  className,
}: ChartCardProps) {
  return (
    <Card className={cn("h-[280px] md:h-[320px] flex flex-col rounded-xl md:rounded-[14px]", className)}>
      {/* Header Section */}
      <CardHeader className="mb-4 flex-shrink-0">
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

      {/* Chart Content - flex-1 to take remaining space, min-h-0 to allow shrinking */}
      <div className="flex-1 min-h-0 overflow-hidden w-full h-full">
        {children}
      </div>
    </Card>
  );
}
