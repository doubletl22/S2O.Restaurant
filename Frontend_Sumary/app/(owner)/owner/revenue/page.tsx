"use client";

import React from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from "recharts";
import { 
  Download, 
  Calendar, 
  TrendingUp, 
  CreditCard, 
  DollarSign, 
  ShoppingBag 
} from "lucide-react";

// Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// --- MOCK DATA (Lấy từ Revenue.jsx cũ) ---
const revenueData = [
  { name: "T2", revenue: 4000, profit: 2400 },
  { name: "T3", revenue: 3000, profit: 1398 },
  { name: "T4", revenue: 2000, profit: 9800 },
  { name: "T5", revenue: 2780, profit: 3908 },
  { name: "T6", revenue: 1890, profit: 4800 },
  { name: "T7", revenue: 2390, profit: 3800 },
  { name: "CN", revenue: 3490, profit: 4300 },
];

const sourceData = [
  { name: "Tại chỗ", value: 45, color: "#3b82f6" },   // Blue
  { name: "Mang về", value: 30, color: "#10b981" },   // Green
  { name: "Giao hàng", value: 25, color: "#f97316" }, // Orange
];

const transactions = [
  { id: "#ORD-001", time: "10:30 AM", customer: "Nguyễn Văn A", total: "500.000đ", method: "Momo", status: "Success" },
  { id: "#ORD-002", time: "11:15 AM", customer: "Trần Thị B", total: "1.200.000đ", method: "Thẻ Visa", status: "Pending" },
  { id: "#ORD-003", time: "12:00 PM", customer: "Lê Văn C", total: "350.000đ", method: "Tiền mặt", status: "Success" },
  { id: "#ORD-004", time: "01:45 PM", customer: "Phạm Thị D", total: "890.000đ", method: "ZaloPay", status: "Failed" },
];

export default function RevenuePage() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-(--text)">Báo cáo Doanh thu</h2>
          <p className="text-muted-foreground">Theo dõi dòng tiền và hiệu suất kinh doanh.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select defaultValue="week">
            <SelectTrigger className="w-35 bg-white">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Hôm nay</SelectItem>
              <SelectItem value="week">Tuần này</SelectItem>
              <SelectItem value="month">Tháng này</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download size={16} /> Xuất Excel
          </Button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Tổng Doanh Thu" 
          value="128.500.000đ" 
          icon={<DollarSign className="h-4 w-4 text-emerald-600" />} 
          trend="+12% so với tuần trước" 
        />
        <StatsCard 
          title="Lợi Nhuận Ròng" 
          value="45.200.000đ" 
          icon={<TrendingUp className="h-4 w-4 text-blue-600" />} 
          trend="+8.5% tăng trưởng" 
        />
        <StatsCard 
          title="Đơn Hàng Mới" 
          value="1,245" 
          icon={<ShoppingBag className="h-4 w-4 text-orange-600" />} 
          trend="-2% đơn hủy" 
        />
        <StatsCard 
          title="Giá Trị TB/Đơn" 
          value="350.000đ" 
          icon={<CreditCard className="h-4 w-4 text-purple-600" />} 
          trend="+50k upsell" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-7">
        
        {/* Biểu đồ cột (Chiếm 4/7 cột) */}
        <Card className="md:col-span-4 shadow-sm border-(--line)">
          <CardHeader>
            <CardTitle>Biểu đồ Doanh thu & Lợi nhuận</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
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
                    tickFormatter={(value) => `${value / 1000}k`} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" name="Doanh thu" fill="var(--g1)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Lợi nhuận" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Biểu đồ tròn (Chiếm 3/7 cột) */}
        <Card className="md:col-span-3 shadow-sm border-(--line)">
          <CardHeader>
            <CardTitle>Nguồn đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions Table */}
      <Card className="shadow-sm border-(--line)">
        <CardHeader>
          <CardTitle>Giao dịch gần nhất</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Thanh toán</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tr, index) => (
                <TableRow key={index}>
                  <TableCell className="font-bold text-(--g1)">{tr.id}</TableCell>
                  <TableCell className="text-muted-foreground">{tr.time}</TableCell>
                  <TableCell className="font-medium">{tr.customer}</TableCell>
                  <TableCell className="font-bold text-green-600">{tr.total}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <CreditCard size={14} className="text-gray-400"/> {tr.method}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      tr.status === "Success" ? "bg-green-50 text-green-700 border-green-200" :
                      tr.status === "Pending" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                      "bg-red-50 text-red-700 border-red-200"
                    }>
                      {tr.status === "Success" ? "Thành công" : tr.status === "Pending" ? "Đang xử lý" : "Thất bại"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Component phụ StatsCard để code gọn hơn
function StatsCard({ title, value, icon, trend }: { title: string, value: string, icon: any, trend: string }) {
  return (
    <Card className="shadow-sm border-(--line)">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-(--text)">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {trend}
        </p>
      </CardContent>
    </Card>
  );
}