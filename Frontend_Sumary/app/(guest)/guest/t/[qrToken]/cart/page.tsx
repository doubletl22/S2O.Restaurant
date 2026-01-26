'use client'
import { GuestHeader } from '@/components/guest/guest-header' // File bạn đã upload

export default function CartPage() {
  return (
    <div>
      <GuestHeader title="Giỏ hàng" subtitle="Kiểm tra lại món ăn" showBack={true} />
      
      <div className="flex flex-col items-center justify-center pt-20 px-4 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-3xl">
          🛒
        </div>
        <h3 className="font-bold text-gray-800">Giỏ hàng trống</h3>
        <p className="text-gray-500 text-sm mt-2">
          Bạn chưa chọn món ăn nào. Hãy quay lại menu để gọi món nhé!
        </p>
      </div>
    </div>
  )
}