'use client'

import Image from 'next/image'
import { Plus } from 'lucide-react'

// 1. Định nghĩa chuẩn Interface tại đây để xuất khẩu
export interface GuestProduct {
  id: number
  name: string
  price: number
  image: string
  isAvailable: boolean
  category: string // Đã thêm trường này để khớp với MenuPage
}

interface MenuItemCardProps {
  product: GuestProduct
  onAddToCart: (product: GuestProduct) => void
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

export function MenuItemCardV2({ product, onAddToCart }: MenuItemCardProps) {
  const { name, price, image, isAvailable } = product

  return (
    <div className="bg-white border rounded-[20px] p-3 shadow-sm flex gap-3">
      <div className="relative w-23 h-23 shrink-0">
        {image ? (
          <Image
            src={image}
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
        
        {!isAvailable && (
          <div className="absolute inset-0 rounded-[18px] bg-black/50 flex items-center justify-center">
            <span className="text-white text-xs font-semibold px-2 py-1 rounded-full bg-black/60">
              Hết món
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 justify-between py-0.5">
        <div>
          <h4 className="font-bold text-sm line-clamp-2 leading-tight text-gray-800">
            {name}
          </h4>
          <p className="font-extrabold text-base mt-1 text-orange-600">
            {formatPrice(price)}
          </p>
        </div>
        
        <button
          onClick={() => isAvailable && onAddToCart(product)}
          disabled={!isAvailable}
          className="self-end flex items-center gap-1 bg-orange-100 text-orange-600 rounded-full px-3 py-1.5 font-bold text-xs transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-200"
        >
          <Plus size={14} strokeWidth={3} />
          <span>Thêm</span>
        </button>
      </div>
    </div>
  )
}