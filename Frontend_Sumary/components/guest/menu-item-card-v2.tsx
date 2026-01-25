'use client'

import Image from 'next/image'

interface Product {
  id: number
  name: string
  price: number
  image: string
  isAvailable: boolean
}

interface MenuItemCardProps {
  product: Product
  onAddToCart: (product: Product) => void
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

export function MenuItemCardV2({ product, onAddToCart }: MenuItemCardProps) {
  const { name, price, image, isAvailable } = product

  return (
    <div className="bg-white border rounded-[20px] p-3 shadow-sm flex gap-3">
      {/* Product Image - Legacy style: w-[92px] h-[92px] rounded-[18px] */}
      <div className="relative w-[92px] h-[92px] flex-shrink-0">
        {image ? (
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            fill
            className="rounded-[18px] bg-gray-100 object-cover"
            sizes="92px"
          />
        ) : (
          <div className="w-full h-full rounded-[18px] bg-gray-100 flex items-center justify-center">
            <span className="text-2xl opacity-30">🍽️</span>
          </div>
        )}
        
        {/* Unavailable Overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 rounded-[18px] bg-black/50 flex items-center justify-center">
            <span className="text-white text-xs font-semibold px-2 py-1 rounded-full bg-black/60">
              Hết món
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 justify-between py-0.5">
        <div>
          <h4 
            className="font-bold text-sm line-clamp-2 leading-tight"
            style={{ color: 'var(--text)' }}
          >
            {name}
          </h4>
          <p 
            className="font-extrabold text-base mt-1"
            style={{ color: '#f97316' }}
          >
            {formatPrice(price)}
          </p>
        </div>
        
        {/* Add Button - Legacy style: bg-gradient-to-r from-(--g1) to-(--g2) */}
        <button
          onClick={() => isAvailable && onAddToCart(product)}
          disabled={!isAvailable}
          className="bg-gradient-to-r from-(--g1) to-(--g2) text-white rounded-xl px-4 py-2 font-bold text-sm self-start transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={`Add ${name} to cart`}
        >
          Thêm
        </button>
      </div>
    </div>
  )
}
