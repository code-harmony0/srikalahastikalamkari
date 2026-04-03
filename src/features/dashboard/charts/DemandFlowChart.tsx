"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts"

interface DemandFlowChartProps {
  data: {
    date: string
    orders: number
    items_sold: number
    revenue: number
  }[]
}

const formatRevenue = (value: number) => {
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`
  return `₹${value}`
}

export function DemandFlowChart({ data }: DemandFlowChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 10, right: 20, left: 5, bottom: 30 }}
      >
        <defs>
          <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#16A34A" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0F172A" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#0F172A" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#cbd5e1"
        />

        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fontWeight: 500, fill: "#64748B" }}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={30}
        />

        <YAxis
          yAxisId="left"
          tick={{ fontSize: 11, fontWeight: 500, fill: "#64748B" }}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={50}
        />

        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 11, fontWeight: 500, fill: "#64748B" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatRevenue}
          tickMargin={6}
          width={65}
        />

        <Tooltip
          contentStyle={{
            backgroundColor: "#FFFFFF",
            border: "none",
            borderRadius: "12px",
            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
            padding: "12px 16px",
          }}
          itemStyle={{
            fontSize: "12px",
            fontWeight: 600,
            paddingBottom: "4px",
          }}
          labelStyle={{
            fontSize: "12px",
            color: "#64748B",
            marginBottom: "8px",
          }}
          formatter={(value: any, name: any) => {
            if (name === "Revenue")
              return [`₹${Number(value).toLocaleString("en-IN")}`, name]
            return [value, name || ""]
          }}
        />

        <Legend
          verticalAlign="top"
          height={36}
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: "12px", fontWeight: 500 }}
        />

        {/* Revenue - Background area with right Y-axis */}
        <Area
          yAxisId="right"
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke="#0F172A"
          strokeWidth={2}
          strokeDasharray="4 4"
          strokeOpacity={0.5}
          fill="url(#colorRevenue)"
          animationDuration={1500}
        />

        {/* Items Sold - Mid layer */}
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="items_sold"
          name="Items Sold"
          stroke="#2563EB"
          strokeWidth={2}
          fill="transparent"
          animationDuration={1500}
        />

        {/* Orders - Primary metric */}
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="orders"
          name="Orders Placed"
          stroke="#16A34A"
          strokeWidth={3}
          fill="url(#colorOrders)"
          fillOpacity={0.1}
          activeDot={{
            r: 5,
            fill: "#16A34A",
            strokeWidth: 2,
            stroke: "#FFFFFF",
          }}
          animationDuration={1500}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
