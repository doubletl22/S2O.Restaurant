'use client'

import { useState } from 'react'
// Import đúng component và interface mới sửa
import { MenuItemCardV2, GuestProduct } from '@/components/guest/menu-item-card-v2'
import { CategoryChips } from '@/components/guest/category-chips'

// Dữ liệu mẫu khớp Interface GuestProduct
const products: GuestProduct[] = [
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
    name: 'Cà Phê Sữa Đá',
    price: 30000,
    image: '/placeholder.svg?height=200&width=200',
    isAvailable: true,
    category: 'Đồ uống',
  },
  {
    id: 3,
    name: 'Bánh Flan',
    price: 20000,
    image: '/placeholder.svg?height=200&width=200',
    isAvailable: true,
    category: 'Tráng miệng',
  },
   // Thêm các món khác...
]

const categories = ['Tất cả', 'Món chính', 'Đồ uống', 'Tráng miệng']

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState(0)
  const [cart, setCart] = useState<GuestProduct[]>([])

  const handleAddToCart = (product: GuestProduct) => {
    setCart((prev) => [...prev, product])
  }

  const filteredProducts = activeCategory === 0
    ? products
    : products.filter((p) => p.category === categories[activeCategory])

  return (
    <div>
      {/* Header đơn giản */}
      <header className="px-5 pt-8 pb-4 bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black text-gray-800">Thực đơn</h1>
            <p className="text-sm text-gray-500 mt-1">S2O Restaurant • Bàn 5</p>
          </div>
          {cart.length > 0 && (
            <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              {cart.length} món
            </div>
          )}
        </div>
      </header>

      {/* Chips */}
      <div className="bg-white pb-2 sticky top-22 z-10">
         <CategoryChips
            categories={categories}
            activeIndex={activeCategory}
            onSelect={setActiveCategory}
         />
      </div>

      {/* List */}
      <section className="px-4 pt-4 flex flex-col gap-3">
        {filteredProducts.map((product) => (
          <MenuItemCardV2
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
          />
        ))}
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            Chưa có món trong danh mục này
          </div>
        )}
      </section>
    </div>
  )
}