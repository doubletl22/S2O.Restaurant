'use client'

import React from "react"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Store,
  Users,
  DollarSign,
  Settings,
  BrainCircuit,
  ChefHat,
  LogOut,
  Menu,
  X,
  QrCode
} from 'lucide-react'

interface MenuItem {
  name: string
  icon: React.ElementType
  path: string
}

interface MenuSection {
  category: string
  items: MenuItem[]
}

// Menu structure matching legacy Sidebar.jsx
const menuItems: MenuSection[] = [
  {
    category: 'Bảng Điều Khiển',
    items: [
      { name: 'Tổng quan', icon: LayoutDashboard, path: '/admin/dashboard' },
    ],
  },
  {
    category: 'Quản trị viên',
    items: [
      { name: 'Quản lý nhà hàng', icon: Store, path: '/admin/restaurants' },
      { name: 'Quản lý doanh thu', icon: DollarSign, path: '/admin/revenue' },
      { name: 'Quản lý người dùng', icon: Users, path: '/admin/users' },
      { name: 'Cấu hình AI', icon: BrainCircuit, path: '/admin/ai-config' },
      { name: 'In mã QR bàn', icon: QrCode, path: '/admin/qr-codes' },
    ],
  },
  {
    category: 'Hệ thống',
    items: [
      { name: 'Món ăn', icon: ChefHat, path: '/admin/products' },
      { name: 'Cài đặt', icon: Settings, path: '/admin/settings' },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Check if path is active (exact match or starts with path for nested routes)
  const isActive = (path: string) => {
    if (path === '/admin/dashboard') {
      return pathname === '/admin/dashboard' || pathname === '/admin'
    }
    return pathname === path || pathname.startsWith(path + '/')
  }

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      document.cookie = 'role=; path=/; max-age=0'
      document.cookie = 's2o_auth_token=; path=/; max-age=0'
      router.push('/login')
      router.refresh()
    }
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        type="button"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 shadow-sm"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? (
          <X className="w-5 h-5 text-gray-700" />
        ) : (
          <Menu className="w-5 h-5 text-gray-700" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Converted from .sidebar CSS class */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 h-screen bg-white border-r border-gray-200
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo Container - Converted from .logo-container */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-center">
            <Image
              src="/images/logo.png"
              alt="The Six Restaurant"
              width={180}
              height={60}
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Menu Container - Converted from .menu-container */}
        <nav className="flex-1 overflow-y-auto p-4">
          {menuItems.map((section, index) => (
            <div key={section.category} className={index > 0 ? 'mt-6' : ''}>
              {/* Category Title - Converted from .menu-title */}
              <h3 className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                {section.category}
              </h3>

              {/* Menu Items */}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.path)

                  return (
                    <li key={item.name}>
                      {/* Link - Converted from .menu-item and .menu-item.active */}
                      <Link
                        href={item.path}
                        onClick={() => setIsMobileOpen(false)}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-xl
                          text-sm font-medium transition-all duration-200
                          ${
                            active
                              ? 'bg-linear-to-r from-[#f97316] to-[#ef4444] text-white shadow-md'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }
                        `}
                      >
                        <Icon className={`w-4.5 h-4.5 shrink-0 ${active ? 'text-white' : 'text-gray-500'}`} />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  )
}
