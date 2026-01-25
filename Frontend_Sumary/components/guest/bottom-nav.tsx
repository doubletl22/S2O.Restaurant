'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, ShoppingCart, Clock, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BottomNavProps {
  qrToken: string
}

export function BottomNav({ qrToken }: BottomNavProps) {
  const pathname = usePathname()
  const basePath = `/guest/t/${qrToken}`

  const navItems = [
    { icon: Home, href: basePath, label: 'Menu' },
    { icon: Search, href: `${basePath}/search`, label: 'Tìm kiếm' },
    { icon: ShoppingCart, href: `${basePath}/cart`, label: 'Giỏ hàng', isCenter: true },
    { icon: Clock, href: `${basePath}/tracking`, label: 'Theo dõi' },
    { icon: User, href: `${basePath}/profile`, label: 'Tài khoản' },
  ]

  return (
    <nav 
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] z-50 flex items-center justify-between px-4"
      style={{
        background: 'var(--card)',
        borderTop: '1px solid var(--line)',
        paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
        paddingTop: '10px',
      }}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon

        if (item.isCenter) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="bg-brand flex items-center justify-center w-14 h-14 rounded-full -mt-7 shadow-brand"
              style={{
                border: '6px solid var(--card)',
              }}
            >
              <Icon className="w-6 h-6 text-white" />
            </Link>
          )
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center justify-center w-11 h-11 rounded-xl transition-colors',
              isActive && 'bg-[rgba(249,115,22,0.1)]'
            )}
            style={{ color: isActive ? '#f97316' : '#9ca3af' }}
          >
            <Icon className="w-5 h-5" />
          </Link>
        )
      })}
    </nav>
  )
}
