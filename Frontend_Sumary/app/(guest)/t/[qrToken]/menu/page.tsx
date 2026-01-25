'use client'

import { useState } from 'react'
import { MenuItemCardV2 } from '@/components/guest/menu-item-card-v2'
import { CategoryChips } from '@/components/guest/category-chips'

// Product interface
interface Product {
  id: number
  name: string
  price: number
  image: string
  isAvailable: boolean
  category: string
}

// Mock data - Pho Bo, Bun Cha, Coffee
const products: Product[] = [
  {
    id: 1,
    name: 'Phở Bò Tái Nạm',
    price: 65000,
    image: '/placeholder.svg?height=200&width=200',
    isAvailable: true,
    category: 'Món chính',
  },
  {
    id: 2,
    name: 'Phở Bò Tái Gân',
    price: 70000,
    image: '/placeholder.svg?height=200&width=200',
    isAvailable: true,
    category: 'Món chính',
  },
  {
    id: 3,
    name: 'Bún Chả Hà Nội',
    price: 60000,
    image: '/placeholder.svg?height=200&width=200',
    isAvailable: true,
    category: 'Món chính',
  },
  {
    id: 4,
    name: 'Bún Chả Nem Cua Bể',
    price: 75000,
    image: '/placeholder.svg?height=200&width=200',
    isAvailable: false,
    category: 'Món chính',
  },
  {
    id: 5,
    name: 'Cà Phê Đen Đá',
    price: 25000,
    image: '/placeholder.svg?height=200&width=200',
    isAvailable: true,
    category: 'Đồ uống',
  },
  {
    id: 6,
    name: 'Cà Phê Sữa Đá',
    price: 30000,
    image: '/placeholder.svg?height=200&width=200',
    isAvailable: true,
    category: 'Đồ uống',
  },
  {
    id: 7,
    name: 'Bạc Xỉu',
    price: 32000,
    image: '/placeholder.svg?height=200&width=200',
    isAvailable: true,
    category: 'Đồ uống',
  },
  {
    id: 8,
    name: 'Trà Đào Cam Sả',
    price: 35000,
    image: '/placeholder.svg?height=200&width=200',
    isAvailable: true,
    category: 'Đồ uống',
  },
]

const categories = ['Tất cả', 'Món chính', 'Đồ uống', 'Tráng miệng']

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState(0)
  const [cart, setCart] = useState<Product[]>([])

  const handleAddToCart = (product: Product) => {
    setCart((prev) => [...prev, product])
  }

  // Filter products by category
  const filteredProducts = activeCategory === 0
    ? products
    : products.filter((p) => p.category === categories[activeCategory])

  return (
    <div>
      {/* Header */}
      <header 
        className="px-4 pt-6 pb-4"
        style={{ background: 'var(--card)' }}
      >
        <h1 
          className="text-xl font-bold"
          style={{ color: 'var(--text)' }}
        >
          Thực đơn
        </h1>
        <p 
          className="text-sm mt-1"
          style={{ color: 'var(--muted)' }}
        >
          Bàn 5 - S2O Restaurant
        </p>
        {cart.length > 0 && (
          <div 
            className="mt-3 px-3 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-2"
            style={{ 
              background: 'rgba(249,115,22,0.1)',
              color: '#f97316'
            }}
          >
            <span>{cart.length} món trong giỏ</span>
          </div>
        )}
      </header>

      {/* Category Chips - Horizontal Scrollable */}
      <CategoryChips
        categories={categories}
        activeIndex={activeCategory}
        onSelect={setActiveCategory}
      />

      {/* Product List */}
      <section className="px-4 pt-2 pb-4 flex flex-col gap-3">
        {filteredProducts.map((product) => (
          <MenuItemCardV2
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
          />
        ))}
        
        {filteredProducts.length === 0 && (
          <div 
            className="text-center py-12"
            style={{ color: 'var(--muted)' }}
          >
            Không có sản phẩm trong danh mục này
          </div>
        )}
      </section>
    </div>
  )
}
