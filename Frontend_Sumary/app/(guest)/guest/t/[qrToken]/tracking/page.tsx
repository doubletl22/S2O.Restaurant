'use client'
import { GuestHeader } from '@/components/guest/guest-header'

export default function TrackingPage() {
  return (
    <div>
      <GuestHeader title="Đơn hàng" subtitle="Theo dõi trạng thái" showBack={false} />

      <div className="flex flex-col items-center justify-center pt-20 px-4 text-center">
         <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-3xl">
          🕒
        </div>
        <h3 className="font-bold text-gray-800">Chưa có đơn hàng</h3>
        <p className="text-gray-500 text-sm mt-2">
          Các món bạn gọi sẽ xuất hiện tại đây.
        </p>
      </div>
    </div>
  )
}