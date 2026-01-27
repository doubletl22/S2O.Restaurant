'use client'

import {
  DollarSign,
  ShoppingCart,
  Users,
  Flame,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react'
import { StatsCard } from '@/components/admin/stats-card'
import { RevenueChart } from '@/components/admin/revenue-chart'

// Mock revenue data for the last 7 days
const revenueData = [
  { day: 'T2', revenue: 4200000 },
  { day: 'T3', revenue: 3800000 },
  { day: 'T4', revenue: 5100000 },
  { day: 'T5', revenue: 4700000 },
  { day: 'T6', revenue: 6200000 },
  { day: 'T7', revenue: 8500000 },
  { day: 'CN', revenue: 7200000 },
]

// Mock top dishes data
const topDishes = [
  { name: 'Phở Bò Tái', orders: 156, revenue: 10140000 },
  { name: 'Bún Chả Hà Nội', orders: 134, revenue: 8040000 },
  { name: 'Cơm Rang Dương Châu', orders: 98, revenue: 5390000 },
  { name: 'Bánh Mì Thịt Nướng', orders: 87, revenue: 3045000 },
]

// Mock recent orders
const recentOrders = [
  { id: 'ORD-001', table: 'Bàn 5', items: 4, total: 285000, status: 'preparing' },
  { id: 'ORD-002', table: 'Bàn 12', items: 2, total: 125000, status: 'completed' },
  { id: 'ORD-003', table: 'Bàn 3', items: 6, total: 420000, status: 'pending' },
  { id: 'ORD-004', table: 'Bàn 8', items: 3, total: 195000, status: 'preparing' },
]

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value)
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'completed':
      return { bg: '#dcfce7', color: '#16a34a', label: 'Hoàn thành' }
    case 'preparing':
      return { bg: '#fef3c7', color: '#d97706', label: 'Đang làm' }
    case 'pending':
      return { bg: '#f3f4f6', color: '#6b7280', label: 'Chờ xử lý' }
    default:
      return { bg: '#f3f4f6', color: '#6b7280', label: status }
  }
}

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
          Dashboard
        </h1>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Tổng quan hoạt động kinh doanh
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Tổng Doanh Thu"
          value={formatCurrency(39700000)}
          change="+12.5% so với tuần trước"
          changeType="positive"
          icon={DollarSign}
          iconColor="#f97316"
        />
        <StatsCard
          title="Đơn Đang Xử Lý"
          value="24"
          change="8 đơn mới trong 1h qua"
          changeType="neutral"
          icon={ShoppingCart}
          iconColor="#3b82f6"
        />
        <StatsCard
          title="Tổng Khách Hàng"
          value="1,248"
          change="+5.2% so với tháng trước"
          changeType="positive"
          icon={Users}
          iconColor="#8b5cf6"
        />
        <StatsCard
          title="Món Bán Chạy"
          value="Phở Bò Tái"
          change="156 phần hôm nay"
          changeType="positive"
          icon={Flame}
          iconColor="#ef4444"
        />
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RevenueChart data={revenueData} />
        </div>

        {/* Top Dishes */}
        <div
          className="bg-white rounded-[20px] p-6 shadow-sm border"
          style={{ borderColor: 'var(--line)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
              Món Bán Chạy
            </h3>
            <TrendingUp className="w-5 h-5" style={{ color: 'var(--muted)' }} />
          </div>

          <div className="flex flex-col gap-4">
            {topDishes.map((dish, idx) => (
              <div key={dish.name} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                  style={{
                    background: idx === 0 ? 'linear-gradient(135deg, #f97316, #ef4444)' : '#f3f4f6',
                    color: idx === 0 ? '#fff' : '#6b7280',
                  }}
                >
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-medium text-sm truncate"
                    style={{ color: 'var(--text)' }}
                  >
                    {dish.name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    {dish.orders} đơn
                  </p>
                </div>
                <span
                  className="text-sm font-semibold"
                  style={{ color: '#f97316' }}
                >
                  {formatCurrency(dish.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div
        className="bg-white rounded-[20px] p-6 shadow-sm border"
        style={{ borderColor: 'var(--line)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
            Đơn Hàng Gần Đây
          </h3>
          <button
            className="flex items-center gap-1 text-sm font-medium"
            style={{ color: '#f97316' }}
          >
            Xem tất cả
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)' }}>
                <th
                  className="text-left py-3 px-4 text-xs font-semibold uppercase"
                  style={{ color: 'var(--muted)' }}
                >
                  Mã Đơn
                </th>
                <th
                  className="text-left py-3 px-4 text-xs font-semibold uppercase"
                  style={{ color: 'var(--muted)' }}
                >
                  Bàn
                </th>
                <th
                  className="text-left py-3 px-4 text-xs font-semibold uppercase"
                  style={{ color: 'var(--muted)' }}
                >
                  Số Món
                </th>
                <th
                  className="text-left py-3 px-4 text-xs font-semibold uppercase"
                  style={{ color: 'var(--muted)' }}
                >
                  Tổng Tiền
                </th>
                <th
                  className="text-left py-3 px-4 text-xs font-semibold uppercase"
                  style={{ color: 'var(--muted)' }}
                >
                  Trạng Thái
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => {
                const status = getStatusStyle(order.status)
                return (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors"
                    style={{ borderBottom: '1px solid var(--line)' }}
                  >
                    <td
                      className="py-3 px-4 text-sm font-medium"
                      style={{ color: 'var(--text)' }}
                    >
                      {order.id}
                    </td>
                    <td
                      className="py-3 px-4 text-sm"
                      style={{ color: 'var(--text)' }}
                    >
                      {order.table}
                    </td>
                    <td
                      className="py-3 px-4 text-sm"
                      style={{ color: 'var(--muted)' }}
                    >
                      {order.items} món
                    </td>
                    <td
                      className="py-3 px-4 text-sm font-semibold"
                      style={{ color: '#f97316' }}
                    >
                      {formatCurrency(order.total)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ background: status.bg, color: status.color }}
                      >
                        {status.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
