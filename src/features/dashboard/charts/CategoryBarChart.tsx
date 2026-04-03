"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Muted, earthy brand colors for calm aesthetic
const BRAND_COLORS = [
  "#881337", // Muted Rose (Sarees)
  "#B45309", // Ochre (Dupattas)
  "#3F6212", // Muted Olive (Fabric)
  "#334155", // Slate (Custom)
];

interface CategoryBarChartProps {
  data: {
    category: string;
    value: number; // Units sold
  }[];
}

export function CategoryBarChart({ data }: CategoryBarChartProps) {
  // Sort data strictly by value descending
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={sortedData}
        layout="vertical"
        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        barSize={32}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          horizontal={true}
          vertical={false}
          stroke="#cbd5e1"
        />
        
        <XAxis type="number" hide />
        
        <YAxis
          dataKey="category"
          type="category"
          tick={{ fontSize: 13, fontWeight: 500, fill: '#475569' }}
          tickLine={false}
          axisLine={false}
          width={100}
        />
        
        <Tooltip
          cursor={{ fill: '#F1F5F9', opacity: 0.5 }}
          contentStyle={{
            backgroundColor: "#FFFFFF",
            border: "none",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            padding: "8px 12px",
          }}
          formatter={(value: any) => [`${value} units`, "Sold"]}
        />

        <Bar
          dataKey="value"
          radius={[0, 4, 4, 0]}
          animationDuration={1500}
        >
          {sortedData.map((entry, index) => (
            <Cell 
                key={`cell-${index}`} 
                fill={BRAND_COLORS[index % BRAND_COLORS.length]} 
                opacity={0.9}
            />
          ))}
          <LabelList 
            dataKey="value" 
            position="right" 
            style={{ fontSize: 12, fontWeight: 600, fill: '#64748B' }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
