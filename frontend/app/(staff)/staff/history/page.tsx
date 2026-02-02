'use client'

import { CheckCircle2 } from 'lucide-react'

const completedOrders = [
  { id: '1', tableNumber: 8, completedAt: new Date(Date.now() - 5 * 60000), itemCount: 3, total: 185000 },
  { id: '2', tableNumber: 4, completedAt: new Date(Date.now() - 15 * 60000), itemCount: 2, total: 120000 },
  { id: '3', tableNumber: 11, completedAt: new Date(Date.now() - 25 * 60000), itemCount: 5, total: 295000 },
  { id: '4', tableNumber: 1, completedAt: new Date(Date.now() - 45 * 60000), itemCount: 4, total: 220000 },
  { id: '5', tableNumber: 9, completedAt: new Date(Date.now() - 60 * 60000), itemCount: 2, total: 95000 },
]

function formatTime(date: Date) {
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

export default function OrderHistoryPage() {
  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
          Order History
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Các đơn đã hoàn thành hôm nay
        </p>
      </div>

      {/* Orders List */}
      <div className="flex flex-col gap-3">
        {completedOrders.map((order) => (
          <div
            key={order.id}
            className="flex items-center gap-4 p-4 rounded-2xl"
            style={{ 
              background: 'var(--card)',
              boxShadow: 'var(--shadow)'
            }}
          >
            {/* Icon */}
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(34, 197, 94, 0.12)' }}
            >
              <CheckCircle2 className="w-6 h-6" style={{ color: '#22c55e' }} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold" style={{ color: 'var(--text)' }}>
                  Bàn #{order.tableNumber}
                </span>
                <span 
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: 'rgba(34, 197, 94, 0.12)', color: '#22c55e' }}
                >
                  Hoàn thành
                </span>
              </div>
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                {order.itemCount} món • {formatTime(order.completedAt)}
              </p>
            </div>

            {/* Total */}
            <span 
              className="font-bold text-lg shrink-0"
              style={{ color: 'var(--text)' }}
            >
              {formatPrice(order.total)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
