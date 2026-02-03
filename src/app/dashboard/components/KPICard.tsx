"use client";

import React from "react";
import { Card, CardContent } from "@/shared/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ResponsiveContainer, Area, AreaChart } from "recharts";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
  };
  sparklineData?: Array<{ value: number }>;
  gradient?: {
    from: string;
    to: string;
  };
  onClick?: () => void;
  comparison?: string;
  borderColor?: string;
  shadowColor?: string;
  theme?: "light" | "dark"; // Add theme prop
}

export function KPICard({
  title,
  value,
  icon,
  trend,
  sparklineData,
  gradient,
  onClick,
  comparison,
  borderColor = "border-slate-300",
  shadowColor = "shadow-slate-500/30",
  theme = "light", // Default to light theme
}: KPICardProps) {
  // Generate stable unique ID for this card instance
  const cardId = React.useMemo(() => `${title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`, [title]);
  
  const getTrendIcon = () => {
    if (!trend) return null;

    switch (trend.direction) {
      case "up":
        return <TrendingUp className="h-4 w-4" />;
      case "down":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return "text-slate-600";

    switch (trend.direction) {
      case "up":
        return "text-emerald-600";
      case "down":
        return "text-red-600";
      default:
        return "text-slate-600";
    }
  };

  const cardGradient = gradient
    ? `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`
    : theme === "dark" 
      ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
      : "white";

  // Theme-based text colors - Fixed to use black text instead of blue
  const titleColor = theme === "dark" ? "text-slate-400" : "text-slate-600";
  const valueColor = theme === "dark" ? "text-white" : "text-black";
  const iconBgColor = theme === "dark" ? "bg-white/10" : "bg-white/90";
  const iconBorderColor = theme === "dark" ? "border-white/20" : "border-slate-300/60";

  // Override border and shadow for dark theme
  const finalBorderColor = theme === "dark" ? "border-0" : borderColor;
  const finalShadowColor = theme === "dark" ? "shadow-slate-900/50" : shadowColor;

  // Get stroke color based on trend with enhanced colors
  const getStrokeColor = () => {
    if (!trend) return "#3b82f6"; // default blue
    switch (trend.direction) {
      case "up":
        return "#10b981"; // emerald-500
      case "down":
        return "#ef4444"; // red-500
      default:
        return "#6366f1"; // indigo-500
    }
  };

  // Get gradient colors for area fill
  const getGradientColors = () => {
    if (!trend) return { start: "#3b82f6", end: "#3b82f6" };
    switch (trend.direction) {
      case "up":
        return { start: "#10b981", end: "#059669" }; // emerald gradient
      case "down":
        return { start: "#ef4444", end: "#dc2626" }; // red gradient
      default:
        return { start: "#6366f1", end: "#4f46e5" }; // indigo gradient
    }
  };

  const gradientColors = getGradientColors();

  return (
    <Card
      className={`${finalBorderColor} border shadow-sm hover:shadow-lg ${finalShadowColor} hover:scale-[1.01] transition-all duration-300 cursor-pointer group relative overflow-hidden ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
      style={theme === "dark" ? {
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        backgroundColor: "#0f172a",
      } : {
        background: cardGradient,
      }}
    >
      <CardContent className="p-5">
        {/* Top Section - Icon and Title */}
        <div className="flex items-start justify-between mb-4">
          <div className={`h-11 w-11 rounded-xl ${iconBgColor} backdrop-blur-sm flex items-center justify-center border ${iconBorderColor} shadow-sm group-hover:scale-105 transition-transform`}>
            {icon}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 ${getTrendColor()} bg-white/50 dark:bg-black/20 px-2 py-1 rounded-lg`}>
              {getTrendIcon()}
              <span className="text-xs font-bold">
                {trend.value > 0 ? "+" : ""}
                {trend.value}%
              </span>
            </div>
          )}
        </div>

        {/* Middle Section - Value and Title */}
        <div className="mb-3">
          <p className={`text-xs font-semibold ${titleColor} uppercase tracking-wide mb-1.5`}>
            {title}
          </p>
          <h3 className={`text-3xl font-bold ${valueColor} tracking-tight leading-none`}>
            {value}
          </h3>
          {comparison && (
            <p className={`text-xs font-medium ${theme === "dark" ? "text-slate-400" : "text-slate-500"} mt-1`}>
              {comparison}
            </p>
          )}
        </div>

        {/* Bottom Section - Sparkline Graph - FIXED */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="w-full mt-2" style={{ height: '48px' }}>
            <ResponsiveContainer width="100%" height={48}>
              <AreaChart data={sparklineData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id={`gradient-${cardId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={gradientColors.start} stopOpacity={0.6} />
                    <stop offset="50%" stopColor={gradientColors.start} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={gradientColors.end} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={getStrokeColor()}
                  strokeWidth={2}
                  fill={`url(#gradient-${cardId})`}
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={1500}
                  baseValue="dataMin"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Hero KPI Card (for main revenue/metric)
export function HeroKPICard({
  title,
  value,
  icon,
  trend,
  sparklineData,
  onClick,
  metrics,
}: KPICardProps & {
  metrics?: Array<{ label: string; value: string }>;
}) {
  // Generate stable unique ID for hero card
  const heroCardId = React.useMemo(() => `hero-${title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`, [title]);
  
  return (
    <Card
      className="bg-slate-900 border-0 shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 relative overflow-hidden group cursor-pointer h-full w-full"
      onClick={onClick}
    >
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 group-hover:bg-emerald-500/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 transition-all duration-500" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-slate-500/5 group-hover:bg-slate-500/10 rounded-full blur-[30px] translate-y-1/2 -translate-x-1/2 transition-all duration-500" />

      <CardContent className="p-4 relative z-10 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2 px-2.5 py-1 text-[9px] font-bold tracking-wider uppercase inline-block rounded-lg">
              {title}
            </div>
            <h3 className="text-2xl font-black text-white tabular-nums tracking-tight mb-1.5">
              {value}
            </h3>
            {trend && (
              <div className="flex items-center gap-1.5 text-slate-300">
                {trend.direction === "up" ? (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-red-400" />
                )}
                <span className="text-[10px] font-semibold">
                  {trend.value > 0 ? "+" : ""}
                  {trend.value}% from last month
                </span>
              </div>
            )}
          </div>
          <div className="h-10 w-10 rounded-xl bg-white/5 backdrop-blur-sm flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform duration-300 shrink-0">
            {icon}
          </div>
        </div>

        {/* Enhanced Sparkline for Hero Card - FIXED */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="w-full mt-3" style={{ height: '48px' }}>
            <ResponsiveContainer width="100%" height={48}>
              <AreaChart data={sparklineData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id={`gradient-${heroCardId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="30%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="70%" stopColor="#059669" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="transparent" stopOpacity={0} />
                  </linearGradient>
                  <filter id={`hero-glow-${heroCardId}`}>
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <Area
                  type="natural"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill={`url(#gradient-${heroCardId})`}
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={2000}
                  baseValue="dataMin"
                  filter={`url(#hero-glow-${heroCardId})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Additional Metrics */}
        {metrics && metrics.length > 0 && (
          <div className="mt-2 flex items-center gap-2">
            {metrics.map((metric, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 px-2 py-1 rounded-lg flex-1">
                <p className="text-slate-400 text-[8px] uppercase font-bold tracking-wider mb-0.5">
                  {metric.label}
                </p>
                <p className="text-white font-bold text-xs">{metric.value}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
