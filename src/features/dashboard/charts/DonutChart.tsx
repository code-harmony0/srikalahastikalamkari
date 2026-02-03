"use client";

import * as React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  Sector,
  Label,
} from "recharts";

const KALAMKARI_PALETTE = [
  "#9F1239", // Rose 900 (Alizarin/Deep Red)
  "#B45309", // Amber 700 (Mustard/Ochre)
  "#15803D", // Emerald 700 (Leaf Green)
  "#4F46E5", // Indigo 600 (Natural Indigo)
];

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

  return (
    <g>
      <text x={cx} y={cy} dy={-8} textAnchor="middle" fill="#64748B" fontSize={12} fontWeight={500}>
        Total Revenue
      </text>
      <text x={cx} y={cy} dy={16} textAnchor="middle" fill="#0F172A" fontSize={18} fontWeight={700}>
        {payload.valueFormatted || value}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius - 4} // Subtle inner highlight
        outerRadius={innerRadius}
        fill={fill}
        opacity={0.2}
      />
    </g>
  );
};

export interface DonutChartData {
  name: string;
  value: number;
  color?: string;
  valueFormatted?: string;
  [key: string]: string | number | undefined; // Index signature for Recharts compatibility
}

export interface DonutChartProps {
  data: DonutChartData[];
  height?: number;
}

export function DonutChart({
  data,
  height = 240,
}: DonutChartProps) {
  
  // Sort data by value desc
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  
  // Inject Kalamkari colors if not provided
  const coloredData = sortedData.map((item, index) => ({
    ...item,
    fill: item.color || KALAMKARI_PALETTE[index % KALAMKARI_PALETTE.length],
  }));

  const totalValue = sortedData.reduce((acc, curr) => acc + curr.value, 0);
  const formattedTotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumSignificantDigits: 3,
  }).format(totalValue);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
         <Pie
          data={coloredData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={2}

        >
           {/* Center Text Trick requires activeShape or custom label. 
               renderActiveShape handles the center text dynamically based on the first item, 
               but we actually want the TOTAL in the center always.
           */}
           <Label
             content={({ viewBox }) => {
               if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <>
                     <text x={viewBox.cx} y={viewBox.cy! - 10} textAnchor="middle" fill="#64748B" fontSize={12} fontWeight={600} fontFamily="var(--font-sans)">
                       TOTAL
                     </text>
                     <text x={viewBox.cx} y={viewBox.cy! + 14} textAnchor="middle" fill="#0F172A" fontSize={16} fontWeight={800} fontFamily="var(--font-sans)">
                        {formattedTotal}
                     </text>
                  </>
                );
               }
               return null;
             }}
             position="center"
           />
           {coloredData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={0} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: any) => [
            new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(value) || 0), 
            "Revenue"
          ]}
          contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
        />
        <Legend
          layout="vertical"
          verticalAlign="middle"
          align="right"
          iconSize={8}
          height={160}
          iconType="circle"
          content={({ payload }) => (
            <div className="flex flex-col gap-2 ml-4">
              {coloredData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }} />
                  <span className="flex-1 truncate">{entry.name}</span>
                  <span className="font-bold text-slate-900">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(entry.value)}
                  </span>
                </div>
              ))}
            </div>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
