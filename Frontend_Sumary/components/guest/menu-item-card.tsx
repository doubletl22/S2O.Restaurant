'use client'

import { Plus } from 'lucide-react'
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

export function MenuItemCard({ product, onAddToCart }: MenuItemCardProps) {
  const { name, price, image, isAvailable } = product

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        borderRadius: 'var(--r20)',
        background: 'var(--card)',
        boxShadow: '0 10px 24px rgba(17,24,39,0.06)',
        border: '1px solid rgba(238,240,244,0.9)',
        opacity: isAvailable ? 1 : 0.6,
      }}
    >
      {/* Product Image */}
      <div className="relative w-full aspect-square">
        {image ? (
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ background: '#e5e7eb' }}
          >
            <span className="text-3xl opacity-30">🍽️</span>
          </div>
        )}
        
        {/* Unavailable Overlay */}
        {!isAvailable && (
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)' }}
          >
            <span className="text-white text-xs font-semibold px-2 py-1 rounded-full bg-black/60">
              Hết món
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col p-3">
        <h4 
          className="font-bold text-sm line-clamp-2 leading-tight"
          style={{ color: 'var(--text)' }}
        >
          {name}
        </h4>
        
        <div className="flex items-center justify-between mt-2">
          <p 
            className="font-extrabold text-sm"
            style={{ color: '#f97316' }}
          >
            {formatPrice(price)}
          </p>
          
          <button
            onClick={() => isAvailable && onAddToCart(product)}
            disabled={!isAvailable}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-95 disabled:cursor-not-allowed"
            style={{
              background: isAvailable ? 'rgba(249,115,22,0.12)' : 'rgba(107,114,128,0.12)',
              color: isAvailable ? '#f97316' : '#6b7280',
            }}
            aria-label={`Add ${name} to cart`}
          >
            <Plus className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  )
}
