'use client'

import React from "react"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Store,
  UtensilsCrossed,
  CalendarDays,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Utensils,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AUTH_COOKIE_NAME, ROLE_COOKIE_NAME } from '@/lib/auth'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  roles?: string[]
}

const adminNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: 'Nhà hàng',
    href: '/admin/tenants',
    icon: <Store className="w-5 h-5" />,
    roles: ['SuperAdmin'],
  },
  {
    label: 'Chi nhánh',
    href: '/admin/branches',
    icon: <Store className="w-5 h-5" />,
  },
  {
    label: 'Thực đơn',
    href: '/admin/menu',
    icon: <UtensilsCrossed className="w-5 h-5" />,
  },
  {
    label: 'Đặt bàn',
    href: '/admin/bookings',
    icon: <CalendarDays className="w-5 h-5" />,
  },
  {
    label: 'Nhân viên',
    href: '/admin/staff',
    icon: <Users className="w-5 h-5" />,
  },
  {
    label: 'Cài đặt',
    href: '/admin/settings',
    icon: <Settings className="w-5 h-5" />,
  },
]

const staffNavItems: NavItem[] = [
  {
    label: 'Bếp',
    href: '/staff',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: 'Nhận order',
    href: '/staff/orders',
    icon: <UtensilsCrossed className="w-5 h-5" />,
  },
  {
    label: 'Đặt bàn',
    href: '/staff/bookings',
    icon: <CalendarDays className="w-5 h-5" />,
  },
]

export function Sidebar({ type = 'admin' }: { type?: 'admin' | 'staff' }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navItems = type === 'admin' ? adminNavItems : staffNavItems

  const handleLogout = () => {
    // Clear cookies
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0`
    document.cookie = `${ROLE_COOKIE_NAME}=; path=/; max-age=0`
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Mobile Header */}
      <header 
        className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
        style={{ 
          background: 'var(--card)',
          borderBottom: '1px solid var(--line)'
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="bg-brand w-9 h-9 rounded-xl flex items-center justify-center"
          >
            <Utensils className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold" style={{ color: 'var(--text)' }}>
            S2O.Restaurant
          </span>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-xl"
          style={{ background: 'var(--bg)' }}
        >
          <Menu className="w-5 h-5" style={{ color: 'var(--text)' }} />
        </button>
      </header>

      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full z-50 transition-all duration-300',
          'lg:translate-x-0 lg:static',
          isCollapsed ? '-translate-x-full lg:w-20' : 'translate-x-0 w-64'
        )}
        style={{ 
          background: 'var(--card)',
          borderRight: '1px solid var(--line)'
        }}
      >
        {/* Logo */}
        <div className="hidden lg:flex items-center justify-between p-4 h-16">
          <div className={cn('flex items-center gap-3', isCollapsed && 'lg:justify-center lg:w-full')}>
            <div 
              className="bg-brand w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            >
              <Utensils className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <span className="font-bold text-lg" style={{ color: 'var(--text)' }}>
                S2O
              </span>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              'p-2 rounded-lg transition-colors hover:bg-(--bg)',
              isCollapsed && 'lg:hidden'
            )}
          >
            <ChevronLeft 
              className={cn('w-5 h-5 transition-transform', isCollapsed && 'rotate-180')} 
              style={{ color: 'var(--muted)' }}
            />
          </button>
        </div>

        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-3 p-4 pt-5">
          <div className="bg-brand w-10 h-10 rounded-xl flex items-center justify-center">
            <Utensils className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg" style={{ color: 'var(--text)' }}>
            S2O.Restaurant
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 px-3 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== `/${type}` && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsCollapsed(true)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                  isCollapsed && 'lg:justify-center lg:px-0',
                  isActive 
                    ? 'bg-brand text-white shadow-brand' 
                    : 'hover:bg-(--bg)'
                )}
                style={{ color: isActive ? '#fff' : 'var(--text)' }}
              >
                {item.icon}
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <button
            onClick={handleLogout}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
              'hover:bg-red-50 hover:text-red-500',
              isCollapsed && 'lg:justify-center lg:px-0'
            )}
            style={{ color: 'var(--muted)' }}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && (
              <span className="text-sm font-medium">Đăng xuất</span>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}
