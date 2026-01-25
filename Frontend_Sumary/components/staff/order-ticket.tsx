'use client'

import { Check, Printer } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface OrderItem {
  id: string
  name: string
  quantity: number
  note?: string
  isDone: boolean
}

export interface Order {
  id: string
  tableNumber: number
  createdAt: Date
  items: OrderItem[]
}

interface OrderTicketProps {
  order: Order
  onToggleItem: (orderId: string, itemId: string) => void
  onCompleteAll: (orderId: string) => void
  onPrint: (orderId: string) => void
}

function getTimeElapsed(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'Vừa xong'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  return `${diffHours}h ${diffMins % 60}m ago`
}

function getUrgencyColor(date: Date): string {
  const now = new Date()
  const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000)
  
  if (diffMins >= 15) return '#ef4444' // Red - urgent
  if (diffMins >= 10) return '#f97316' // Orange - warning
  return 'var(--muted)' // Normal
}

export function OrderTicket({ order, onToggleItem, onCompleteAll, onPrint }: OrderTicketProps) {
  const allDone = order.items.every(item => item.isDone)
  const timeColor = getUrgencyColor(order.createdAt)

  return (
    <div 
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{ 
        background: 'var(--card)',
        boxShadow: 'var(--shadow)',
        border: '1px solid var(--line)'
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3"
        style={{ 
          borderBottom: '1px solid var(--line)',
          background: allDone ? 'rgba(34, 197, 94, 0.08)' : undefined
        }}
      >
        <div className="flex items-center gap-3">
          <span 
            className="text-2xl font-bold"
            style={{ color: 'var(--text)' }}
          >
            #{order.tableNumber}
          </span>
          {allDone && (
            <span 
              className="px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}
            >
              Xong
            </span>
          )}
        </div>
        <span 
          className="text-sm font-medium"
          style={{ color: timeColor }}
        >
          {getTimeElapsed(order.createdAt)}
        </span>
      </div>

      {/* Body - Item List */}
      <div className="flex flex-col gap-1 p-3">
        {order.items.map((item) => (
          <button
            key={item.id}
            onClick={() => onToggleItem(order.id, item.id)}
            className={cn(
              'flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all',
              'hover:bg-[var(--bg)]'
            )}
          >
            {/* Checkbox */}
            <div 
              className={cn(
                'w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all',
                item.isDone ? 'bg-green-500' : 'border-2'
              )}
              style={{ borderColor: item.isDone ? undefined : 'var(--line)' }}
            >
              {item.isDone && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
            </div>
            
            {/* Item Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span 
                  className={cn(
                    'font-semibold text-sm transition-all',
                    item.isDone && 'line-through opacity-50'
                  )}
                  style={{ color: 'var(--text)' }}
                >
                  {item.quantity}x {item.name}
                </span>
              </div>
              {item.note && (
                <p 
                  className={cn(
                    'text-xs mt-0.5',
                    item.isDone && 'line-through opacity-50'
                  )}
                  style={{ color: 'var(--muted)' }}
                >
                  Ghi chú: {item.note}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div 
        className="flex items-center gap-2 px-3 pb-3"
      >
        <button
          onClick={() => onCompleteAll(order.id)}
          disabled={allDone}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all',
            allDone 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:opacity-90'
          )}
          style={{ 
            background: '#22c55e',
            color: '#fff'
          }}
        >
          <Check className="w-4 h-4" strokeWidth={2.5} />
          Complete All
        </button>
        <button
          onClick={() => onPrint(order.id)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-80"
          style={{ 
            background: 'var(--bg)',
            color: 'var(--muted)'
          }}
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
      </div>
    </div>
  )
}
