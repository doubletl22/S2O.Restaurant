'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, Clock } from 'lucide-react'
import { useGuestCart } from '@/components/guest/guest-cart-context' // Import Hook

export function BottomNavV2({ tableId }: { tableId: string }) {
  const pathname = usePathname()
  
  // 1. Lấy tổng số lượng món từ Context
  const { totalItems } = useGuestCart(); 

  const navItems = [
    {
      label: 'Thực đơn',
      icon: Home,
      href: `/guest/t/${tableId}/menu`,
      isActive: pathname.includes('/menu')
    },
    {
      label: 'Giỏ hàng',
      icon: ShoppingBag,
      href: `/guest/t/${tableId}/cart`,
      isActive: pathname.includes('/cart'),
      badge: totalItems // Gắn badge vào đây
    },
    {
      label: 'Đã gọi',
      icon: Clock,
      href: `/guest/t/${tableId}/tracking`,
      isActive: pathname.includes('/tracking')
    }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-50 pb-safe">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex flex-col items-center gap-1 relative ${
            item.isActive ? 'text-orange-600' : 'text-gray-400'
          }`}
        >
          {/* Render Icon & Badge */}
          <div className="relative">
             <item.icon className={`w-6 h-6 ${item.isActive ? 'fill-current' : ''}`} />
             
             {/* Hiển thị chấm đỏ nếu có badge > 0 */}
             {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white">
                  {item.badge}
                </span>
             )}
          </div>
          
          <span className="text-[10px] font-medium">{item.label}</span>
        </Link>
      ))}
    </div>
  )
}