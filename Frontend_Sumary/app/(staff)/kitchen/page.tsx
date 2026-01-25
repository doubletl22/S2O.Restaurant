'use client'

import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import { OrderTicket, type Order } from '@/components/staff/order-ticket'

// Mock initial orders (simulating SignalR data)
const initialOrders: Order[] = [
  {
    id: '1',
    tableNumber: 5,
    createdAt: new Date(Date.now() - 12 * 60000), // 12 mins ago
    items: [
      { id: '1a', name: 'Phở Bò Tái', quantity: 2, isDone: false },
      { id: '1b', name: 'Bún Chả Hà Nội', quantity: 1, note: 'Ít nước mắm', isDone: false },
      { id: '1c', name: 'Trà Đá', quantity: 3, isDone: true },
    ],
  },
  {
    id: '2',
    tableNumber: 3,
    createdAt: new Date(Date.now() - 8 * 60000), // 8 mins ago
    items: [
      { id: '2a', name: 'Cơm Rang Dương Châu', quantity: 1, isDone: false },
      { id: '2b', name: 'Gỏi Cuốn Tôm Thịt', quantity: 2, isDone: false },
    ],
  },
  {
    id: '3',
    tableNumber: 12,
    createdAt: new Date(Date.now() - 3 * 60000), // 3 mins ago
    items: [
      { id: '3a', name: 'Bánh Mì Thịt Nướng', quantity: 4, note: 'Thêm ớt', isDone: false },
      { id: '3b', name: 'Cà Phê Sữa Đá', quantity: 4, isDone: false },
    ],
  },
  {
    id: '4',
    tableNumber: 7,
    createdAt: new Date(Date.now() - 18 * 60000), // 18 mins ago - urgent
    items: [
      { id: '4a', name: 'Phở Bò Tái', quantity: 1, isDone: true },
      { id: '4b', name: 'Chả Giò', quantity: 2, isDone: true },
      { id: '4c', name: 'Nước Chanh', quantity: 2, isDone: false },
    ],
  },
  {
    id: '5',
    tableNumber: 2,
    createdAt: new Date(Date.now() - 1 * 60000), // 1 min ago
    items: [
      { id: '5a', name: 'Bún Bò Huế', quantity: 2, isDone: false },
      { id: '5b', name: 'Trà Đào', quantity: 2, isDone: false },
    ],
  },
]

export default function KitchenBoardPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Simulate SignalR updates - add new order every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newTableNumber = Math.floor(Math.random() * 15) + 1
      const newOrder: Order = {
        id: `new-${Date.now()}`,
        tableNumber: newTableNumber,
        createdAt: new Date(),
        items: [
          { 
            id: `${Date.now()}-1`, 
            name: ['Phở Bò', 'Bún Chả', 'Cơm Rang', 'Bánh Mì'][Math.floor(Math.random() * 4)], 
            quantity: Math.floor(Math.random() * 3) + 1, 
            isDone: false 
          },
        ],
      }
      setOrders(prev => [newOrder, ...prev])
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleToggleItem = (orderId: string, itemId: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          items: order.items.map(item => 
            item.id === itemId ? { ...item, isDone: !item.isDone } : item
          ),
        }
      }
      return order
    }))
  }

  const handleCompleteAll = (orderId: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          items: order.items.map(item => ({ ...item, isDone: true })),
        }
      }
      return order
    }))
  }

  const handlePrint = (orderId: string) => {
    const order = orders.find(o => o.id === orderId)
    if (order) {
      alert(`Printing ticket for Table #${order.tableNumber}`)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    setIsRefreshing(false)
  }

  // Sort orders: incomplete first, then by time (oldest first for urgency)
  const sortedOrders = [...orders].sort((a, b) => {
    const aAllDone = a.items.every(item => item.isDone)
    const bAllDone = b.items.every(item => item.isDone)
    
    if (aAllDone !== bAllDone) return aAllDone ? 1 : -1
    return a.createdAt.getTime() - b.createdAt.getTime()
  })

  const pendingCount = orders.filter(o => !o.items.every(i => i.isDone)).length

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 
            className="text-2xl font-bold"
            style={{ color: 'var(--text)' }}
          >
            Kitchen Board
          </h1>
          <p 
            className="text-sm mt-1"
            style={{ color: 'var(--muted)' }}
          >
            {pendingCount} đơn đang chờ xử lý
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all hover:opacity-80"
          style={{ 
            background: 'var(--card)',
            color: 'var(--text)',
            boxShadow: 'var(--shadow)'
          }}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Masonry Grid */}
      <div 
        className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4"
        style={{ columnFill: 'balance' }}
      >
        {sortedOrders.map((order) => (
          <div key={order.id} className="mb-4 break-inside-avoid">
            <OrderTicket
              order={order}
              onToggleItem={handleToggleItem}
              onCompleteAll={handleCompleteAll}
              onPrint={handlePrint}
            />
          </div>
        ))}
      </div>

      {/* Empty State */}
      {orders.length === 0 && (
        <div 
          className="flex flex-col items-center justify-center py-20"
          style={{ color: 'var(--muted)' }}
        >
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'var(--card)' }}
          >
            <span className="text-3xl">👨‍🍳</span>
          </div>
          <p className="font-medium">Không có đơn hàng nào</p>
          <p className="text-sm mt-1">Đơn hàng mới sẽ hiển thị tại đây</p>
        </div>
      )}
    </div>
  )
}
