'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { User, LogOut, Key, Edit, ChevronDown } from 'lucide-react'

export function AdminHeader() {
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false)
  const [greeting, setGreeting] = useState('Chào buổi sáng')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) {
      setGreeting('Chào buổi sáng')
    } else if (hour < 18) {
      setGreeting('Chào buổi chiều')
    } else {
      setGreeting('Chào buổi tối')
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      document.cookie = 'role=; path=/; max-age=0'
      document.cookie = 's2o_auth_token=; path=/; max-age=0'
      router.push('/login')
      router.refresh()
    }
  }

  return (
    <header className="hidden lg:flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
      {/* Welcome Text */}
      <div className="text-sm text-gray-600">
        {greeting}!{' '}
        <span className="text-[#f97316] font-bold">Admin</span>
      </div>

      {/* User Profile */}
      <div
        ref={dropdownRef}
        className="relative"
      >
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-xl transition-colors"
        >
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-lient-to-r from-[#f97316] to-[#ef4444] flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700">Đăng xuất</span>
          <ChevronDown 
            className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} 
          />
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
            <button
              type="button"
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => {
                setShowDropdown(false)
              }}
            >
              <Edit className="w-4 h-4 text-gray-500" />
              <span>Chỉnh sửa hồ sơ</span>
            </button>
            
            <button
              type="button"
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => {
                setShowDropdown(false)
                // Navigate to change password page when implemented
              }}
            >
              <Key className="w-4 h-4 text-gray-500" />
              <span>Đổi mật khẩu</span>
            </button>

            {/* Divider */}
            <div className="my-2 border-t border-gray-100" />

            <button
              type="button"
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
