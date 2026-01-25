'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, Clock } from 'lucide-react'

interface BottomNavProps {
  qrToken: string
}

export function BottomNavV2({ qrToken }: BottomNavProps) {
  const pathname = usePathname()
  const basePath = `/t/${qrToken}`

  const navItems = [
    { icon: Home, href: `${basePath}/menu`, label: 'Menu' },
    { icon: ShoppingBag, href: `${basePath}/cart`, label: 'Cart' },
    { icon: Clock, href: `${basePath}/tracking`, label: 'Tracking' },
  ]

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-6"
      style={{
        background: 'var(--card)',
        borderTop: '1px solid var(--line)',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
        paddingTop: '12px',
      }}
    >
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href)
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1"
          >
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl transition-all"
              style={
                isActive
                  ? {
                      background: 'linear-gradient(135deg, var(--g1), var(--g2))',
                    }
                  : undefined
              }
            >
              <Icon 
                className="w-5 h-5" 
                style={{ color: isActive ? '#ffffff' : 'var(--muted)' }}
              />
            </div>
            <span 
              className="text-xs font-medium"
              style={{ color: isActive ? 'var(--g1)' : 'var(--muted)' }}
            >
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
