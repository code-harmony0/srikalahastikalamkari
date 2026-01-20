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
  borderColor = "border-slate-200",
  shadowColor = "shadow-slate-500/30",
}: KPICardProps) {
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
    : "white";

  // Get stroke color based on trend
  const getStrokeColor = () => {
    if (!trend) return "#3b82f6"; // default blue
    return trend.direction === "up" ? "#10b981" : trend.direction === "down" ? "#ef4444" : "#3b82f6";
  };

  return (
    <Card
      className={`${borderColor} border shadow-sm hover:shadow-lg ${shadowColor} hover:scale-[1.01] transition-all duration-300 cursor-pointer group relative overflow-hidden min-h-[120px] ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
      style={{
        background: gradient ? cardGradient : "white",
      }}
    >
      <CardContent className="p-6 h-full flex flex-row items-center justify-between gap-4">
        {/* Left Section - Content */}
        <div className="flex flex-col min-w-0 flex-1">
          {/* Title - Small, uppercase, subtle */}
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            {title}
          </p>

          {/* Value - Large, bold */}
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight leading-none mb-2">
            {value}
          </h3>

          {/* Trend - Below value */}
          {trend && (
            <div className={`flex items-center gap-1.5 ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="text-sm font-semibold">
                {trend.value > 0 ? "+" : ""}
                {trend.value}%
              </span>
              {comparison && (
                <span className="text-xs text-slate-400 ml-1">{comparison}</span>
              )}
            </div>
          )}

          {/* Comparison without trend */}
          {!trend && comparison && (
            <span className="text-xs text-slate-500 font-medium">{comparison}</span>
          )}
        </div>

        {/* Right Section - Icon */}
        <div className="flex flex-col items-center gap-3 shrink-0">
          <div className="h-12 w-12 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center border border-slate-200/60 shadow-sm group-hover:scale-105 transition-transform">
            <div className="scale-110">{icon}</div>
          </div>

          {/* Mini Sparkline */}
          {sparklineData && sparklineData.length > 0 && (
            <div className="w-16 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData}>
                  <defs>
                    <linearGradient id={`gradient-${title.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={getStrokeColor()} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={getStrokeColor()} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={getStrokeColor()}
                    strokeWidth={2}
                    fill={`url(#gradient-${title.replace(/\s+/g, '-')})`}
                    dot={false}
                    animationDuration={1200}
                    isAnimationActive={true}
                    baseValue="dataMin"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
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
  return (
    <Card
      className="bg-slate-900 border-0 shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 relative overflow-hidden group cursor-pointer h-full w-full"
      onClick={onClick}
    >
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 group-hover:bg-emerald-500/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 transition-all duration-500" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/5 group-hover:bg-amber-500/10 rounded-full blur-[30px] translate-y-1/2 -translate-x-1/2 transition-all duration-500" />

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

        {/* Sparkline */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="h-9 -mx-2 mt-2 relative group/hero-chart overflow-hidden rounded-lg">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id="hero-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="60%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="transparent" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="natural"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#hero-gradient)"
                  dot={false}
                  animationDuration={2500}
                  animationEasing="ease-out"
                  isAnimationActive={true}
                  baseValue="dataMin"
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
