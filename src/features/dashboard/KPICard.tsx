"use client"

import * as React from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { ResponsiveContainer, AreaChart, Area } from "recharts"
import { cn } from "@/shared/utils"

/**
 * KPI Card Component
 *
 * Displays key performance indicators with sparkline visualization.
 * Defines the visual language for all card components.
 *
 * Critical Constraints:
 * - Maximum height: 140px (strict)
 * - Padding: 20px (inherited from Card)
 * - Border radius: 14px (inherited from Card)
 * - Equal-width grid layout support
 */

export interface KPICardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: {
    value: number
    direction: "up" | "down" | "neutral"
  }
  sparklineData?: Array<{ value: number }>
  sparklineColor?: string // New prop for semantic control
  gradient?: {
    from: string
    to: string
  }
  onClick?: () => void
  comparison?: string
  className?: string
}

export function KPICard({
  title,
  value,
  icon,
  trend,
  sparklineData,
  sparklineColor, // Destructure new prop
  variant = "default", // "default" | "primary" (Total Revenue)
  onClick,
  comparison,
  className,
}: KPICardProps & { variant?: "default" | "primary" }) {
  // PRIMARY VARIANT (Total Revenue): Solid #0F172A, No Gradient, White Text
  // DEFAULT VARIANT (Others): White Background, Gray Text, Matches Table Cards

  const isPrimary = variant === "primary"

  // Using responsive radius and padding
  const cardStyles = cn(
    "relative overflow-hidden cursor-pointer rounded-xl md:rounded-[14px] p-4 md:p-5 h-[120px] md:h-[140px]",
    "transition-all duration-300 ease-out hover:-translate-y-1",
    isPrimary
      ? "bg-[#0F172A] shadow-lg shadow-slate-900/20 ring-1 ring-white/10"
      : "bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800",
    className,
  )

  // Typography Colors - calmer, more premium
  const titleColor = isPrimary
    ? "text-slate-400"
    : "text-slate-500 dark:text-slate-400"
  const valueColor = isPrimary ? "text-white" : "text-slate-900 dark:text-white"
  const subtextColor = isPrimary
    ? "text-slate-400"
    : "text-slate-500 dark:text-slate-400"

  // Trend Styles - smaller, quieter badges
  // ... (Trend logic mostly same, just keeping context) ...
  const getTrendColor = () => {
    if (!trend) return ""
    if (isPrimary)
      return trend.direction === "up" ? "text-emerald-400" : "text-rose-400"
    return trend.direction === "up" ? "text-emerald-600" : "text-rose-600"
  }

  const getTrendIcon = () => {
    if (!trend) return null
    const Icon =
      trend.direction === "up"
        ? TrendingUp
        : trend.direction === "down"
          ? TrendingDown
          : Minus
    return <Icon className="h-3 w-3" strokeWidth={2.5} />
  }

  // Determine Sparkline Color
  // Priority: Prop > Primary (White) > Default (Gray)
  const finalSparklineColor =
    sparklineColor || (isPrimary ? "#FFFFFF" : "#64748B")

  return (
    <div onClick={onClick} className={cardStyles}>
      <div className="flex flex-col h-full justify-between relative z-10">
        {/* Header: Icon, Title and Trend */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {icon && (
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg",
                  isPrimary
                    ? "bg-white/10 text-white"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
                )}
              >
                {icon}
              </div>
            )}
            <span
              className={cn(
                "text-[11px] font-semibold uppercase tracking-wider",
                titleColor,
              )}
            >
              {title}
            </span>
          </div>

          {/* Trend Badge - Minimalist */}
          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 text-[11px] font-medium",
                getTrendColor(),
              )}
            >
              {getTrendIcon()}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        {/* Value Display */}
        <div className="space-y-1 mt-1">
          <h3 className={cn("text-2xl font-bold tracking-tight", valueColor)}>
            {value}
          </h3>
          {comparison && (
            <p className={cn("text-[11px] font-medium", subtextColor)}>
              {comparison}
            </p>
          )}
        </div>
      </div>

      {/* Sparkline - Line Only, No Fill, Max 18px Height (Strict) */}
      {sparklineData && sparklineData.length > 0 && (
        <div
          className="absolute bottom-5 right-4 md:right-5 w-20 md:w-24 h-[14px] md:h-[18px] pointer-events-none"
          style={{ opacity: 0.35 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <Area
                type="monotone"
                dataKey="value"
                stroke={finalSparklineColor}
                strokeWidth={1.5}
                fill="none" // No fill as requested
                animationDuration={1500}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
