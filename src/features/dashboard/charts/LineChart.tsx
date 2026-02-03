"use client";

import * as React from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

/**
 * Line Chart Component
 * 
 * Displays time-series data with smooth curves.
 * 
 * Specifications:
 * - Maximum 2 lines
 * - Smooth curves (monotone interpolation)
 * - Subtle grid lines
 * - Stroke width: 2px
 * - Dot size: 4px on hover
 * - Muted accent colors for subordination
 */

export interface LineChartData {
  name: string;
  [key: string]: string | number;
}

export interface LineConfig {
  dataKey: string;
  stroke: string;
  name: string;
}

export interface LineChartProps {
  data: LineChartData[];
  lines: LineConfig[]; // Max 2 lines
  xAxisKey?: string;
}

const LineChart = ({ data, lines, xAxisKey = "name" }: LineChartProps) => {
  // We prioritize the first line as PRIMARY (Revenue) and second as SECONDARY (Orders/Other)
  const primaryLine = lines[0];
  const secondaryLine = lines[1];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          className="stroke-slate-100 dark:stroke-slate-800" // Ultra subtle grid
        />
        <XAxis
          dataKey={xAxisKey}
          tick={{ fontSize: 11, fontWeight: 500, fill: '#94A3B8' }}
          tickLine={false}
          axisLine={false}
          tickMargin={12}
        />
        <YAxis
          tick={{ fontSize: 11, fontWeight: 500, fill: '#94A3B8' }}
          tickLine={false}
          axisLine={false}
          tickMargin={12}
          width={40}
          tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            padding: "8px 12px",
          }}
          itemStyle={{ fontSize: "12px", fontWeight: 600 }}
          formatter={(value: any, name: any) => [
            typeof value === 'number' && name.toLowerCase().includes('revenue') 
              ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
              : value,
            name
          ]}
        />
        
        {/* Secondary Line (Orders) - Thin, Muted, Dashed maybe? */}
        {secondaryLine && (
          <Line
            type="monotone"
            dataKey={secondaryLine.dataKey}
            stroke="#CBD5E1" // Slate 300 - very muted
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#CBD5E1" }}
            name={secondaryLine.name}
            animationDuration={1500}
          />
        )}

        {/* Primary Line (Revenue) - Dominant, Solid */}
        <Line
          type="monotone"
          dataKey={primaryLine.dataKey}
          stroke="#0F172A" // Slate 900 - Dominant Black/Navy
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 6, fill: "#0F172A", strokeWidth: 4, stroke: "#E2E8F0" }}
          name={primaryLine.name}
          animationDuration={1500}
        />
        
        <Legend 
           wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }}
           iconType="circle"
           iconSize={8}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export { LineChart };
