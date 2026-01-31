'use client'

import { useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { MenuItemCard } from '@/components/guest/menu-item-card'
import { formatMoney, isSessionExpired, setSession } from '../_shared/guestStore';

// Product interface as specified
interface Product {
  id: number
  name: string
  price: number
  image: string
  isAvailable: boolean
}

// Mock data
const categories = ['Tất cả', 'Món chính', 'Đồ uống', 'Tráng miệng', 'Khai vị']

const products: Product[] = [
  {
    id: 1,
    name: 'Phở Bò Tái',
    price: 65000,
    image: '/placeholder.svg?height=200&width=200',
    isAvailable: true,
  },
  {
    id: 2,
    name: 'Cơm Rang Dương Châu',
    price: 55000,
    image: '/placeholder.svg?height=200&width=200',
    isAvailable: true,
  },
  {
    id: 3,
    name: 'Bún Chả Hà Nội',
    price: 60000,
    image: '/placeholder.svg?height=200&width=200',
    isAvailable: false,
  },
  {
    id: 4,
    name: 'Gỏi Cuốn Tôm Thịt',
    price: 45000,
    image: '/placeholder.svg?height=200&width=200',
    isAvailable: true,
  },
  {
    id: 5,
    name: 'Bánh Mì Thịt Nướng',
    price: 35000,
    image: '/placeholder.svg?height=200&width=200',
    isAvailable: true,
  },
  {
    id: 6,
    name: 'Trà Đào Cam Sả',
    price: 28000,
    image: '/placeholder.svg?height=200&width=200',
    isAvailable: true,
  },
]

export default function GuestMenuPage() {
  const [activeCategory, setActiveCategory] = useState(0)
  const [cart, setCart] = useState<Product[]>([])

  const handleAddToCart = (product: Product) => {
    setCart((prev) => [...prev, product])
  }

  return (
    <div className="pb-24">
      {/* Header with Search */}
      <header 
        className="bg-brand text-white px-4 py-5"
        style={{
          borderBottomLeftRadius: '22px',
          borderBottomRightRadius: '22px',
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="flex flex-col flex-1">
            <span className="font-bold text-lg leading-tight">S2O Restaurant</span>
            <span className="text-xs opacity-90">Bàn 5 - Chi nhánh Hoàn Kiếm</span>
          </div>
          {cart.length > 0 && (
            <div 
              className="px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(255,255,255,0.2)' }}
            >
              {cart.length} món
            </div>
          )}
        </div>
        
        {/* Search Bar */}
        <div 
          className="flex items-center gap-3 px-3 py-3 rounded-xl"
          style={{
            background: '#fff',
            boxShadow: '0 10px 24px rgba(0,0,0,0.1)',
          }}
        >
          <Search className="w-5 h-5 opacity-50" style={{ color: 'var(--muted)' }} />
          <input
            type="text"
            placeholder="Tìm món ăn..."
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ color: 'var(--text)' }}
          />
          <button 
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ border: '1px solid var(--line)' }}
          >
            <SlidersHorizontal className="w-4 h-4" style={{ color: 'var(--muted)' }} />
          </button>
        </div>
      </header>

      {/* Category Chips */}
      <div 
        className="flex gap-3 px-4 pt-4 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {categories.map((category, idx) => (
          <button
            key={category}
            onClick={() => setActiveCategory(idx)}
            className={`flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
              idx === activeCategory ? 'bg-brand text-white' : ''
            }`}
            style={
              idx !== activeCategory
                ? {
                    background: 'var(--card)',
                    color: 'var(--text)',
                    boxShadow: '0 8px 18px rgba(17,24,39,0.06)',
                  }
                : undefined
            }
          >
            {category}
          </button>
        ))}
      </div>

      {/* Menu Section - Grid Layout */}
      <section className="px-4 pt-5">
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>
          Món phổ biến
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {products.map((product) => (
            <MenuItemCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
