"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { RevenueChartData } from "@/services/owner-report.service";

interface RevenueChartProps {
  data: RevenueChartData[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  // Format tiền tệ cho Tooltip
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis 
          dataKey="date" 
          stroke="#888888" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value / 1000}k`} // Rút gọn số liệu trục Y
        />
        <Tooltip 
            formatter={(value: number) => [formatCurrency(value), "Doanh thu"]}
            labelStyle={{ color: "#333" }}
            contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
        />
        <Bar
          dataKey="revenue"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}