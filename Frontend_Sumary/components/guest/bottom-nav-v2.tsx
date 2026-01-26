'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, Clock } from 'lucide-react'

interface BottomNavProps {
  qrToken: string
}

export function BottomNavV2({ qrToken }: BottomNavProps) {
  const pathname = usePathname()
  
  // QUAN TRỌNG: Sửa đường dẫn cơ sở đúng với folder app/guest/t/...
  const basePath = `/guest/t/${qrToken}`

  const navItems = [
    { icon: Home, href: `${basePath}/menu`, label: 'Menu' },
    { icon: ShoppingBag, href: `${basePath}/cart`, label: 'Giỏ hàng' },
    { icon: Clock, href: `${basePath}/tracking`, label: 'Đơn hàng' }, // Đổi label cho ngắn gọn
  ]

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-6 bg-white border-t border-gray-100"
      style={{
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
        paddingTop: '12px',
      }}
    >
      {navItems.map((item) => {
        // Logic active: Kiểm tra nếu pathname chứa href
        const isActive = pathname.includes(item.href)
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 min-w-15"
          >
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
                isActive 
                  ? 'bg-linear-to-br from-orange-500 to-orange-600 text-white shadow-md shadow-orange-200' 
                  : 'text-gray-400 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span 
              className={`text-[10px] font-bold ${
                isActive ? 'text-orange-600' : 'text-gray-400'
              }`}
            >
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}