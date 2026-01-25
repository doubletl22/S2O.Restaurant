'use client'

import { Users } from 'lucide-react'

const tables = [
  { id: 1, status: 'occupied', guests: 4 },
  { id: 2, status: 'occupied', guests: 2 },
  { id: 3, status: 'available', guests: 0 },
  { id: 4, status: 'reserved', guests: 0 },
  { id: 5, status: 'occupied', guests: 3 },
  { id: 6, status: 'available', guests: 0 },
  { id: 7, status: 'occupied', guests: 2 },
  { id: 8, status: 'available', guests: 0 },
  { id: 9, status: 'reserved', guests: 0 },
  { id: 10, status: 'available', guests: 0 },
  { id: 11, status: 'occupied', guests: 5 },
  { id: 12, status: 'occupied', guests: 2 },
]

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  available: { bg: 'rgba(34, 197, 94, 0.12)', text: '#22c55e', label: 'Trống' },
  occupied: { bg: 'rgba(249, 115, 22, 0.12)', text: '#f97316', label: 'Đang dùng' },
  reserved: { bg: 'rgba(99, 102, 241, 0.12)', text: '#6366f1', label: 'Đã đặt' },
}

export default function TablesPage() {
  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
          Tables
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Quản lý trạng thái bàn
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6">
        {Object.entries(statusColors).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ background: value.text }}
            />
            <span className="text-sm" style={{ color: 'var(--muted)' }}>
              {value.label}
            </span>
          </div>
        ))}
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {tables.map((table) => {
          const status = statusColors[table.status]
          return (
            <div
              key={table.id}
              className="flex flex-col items-center justify-center p-6 rounded-2xl cursor-pointer transition-all hover:scale-105"
              style={{ 
                background: status.bg,
                border: `2px solid ${status.text}20`
              }}
            >
              <span 
                className="text-3xl font-bold"
                style={{ color: status.text }}
              >
                {table.id}
              </span>
              <span 
                className="text-xs font-medium mt-2"
                style={{ color: status.text }}
              >
                {status.label}
              </span>
              {table.guests > 0 && (
                <div 
                  className="flex items-center gap-1 mt-2 text-xs"
                  style={{ color: 'var(--muted)' }}
                >
                  <Users className="w-3 h-3" />
                  {table.guests}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
