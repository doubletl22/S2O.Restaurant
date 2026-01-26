'use client'

import { ArrowLeft, Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface GuestHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
}

export function GuestHeader({ title, subtitle, showBack = false }: GuestHeaderProps) {
  const router = useRouter()

  return (
    <header 
      className="bg-orange-600 text-white px-5 py-6 shadow-md relative z-10"
      style={{
        borderBottomLeftRadius: '24px',
        borderBottomRightRadius: '24px',
      }}
    >
      <div className="flex items-center gap-4">
        {/* Nút Back */}
        {showBack ? (
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20 border border-white/30 backdrop-blur-sm transition-transform active:scale-95 hover:bg-white/30"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        ) : (
          // Placeholder để giữ layout cân đối nếu không có nút back
          <div className="w-10 h-10" /> 
        )}

        {/* Title & Subtitle */}
        <div className="flex flex-col flex-1 text-center items-center justify-center mr-10"> 
          {/* mr-10 để bù trừ khoảng trống của nút back, giúp chữ căn giữa */}
          <span className="font-bold text-lg leading-tight tracking-wide">
            {title}
          </span>
          {subtitle && (
            <span className="text-xs font-medium text-orange-50 mt-0.5 opacity-90">
              {subtitle}
            </span>
          )}
        </div>

        {/* Nút Thông báo (Optional) - Hiện tại ẩn đi hoặc để trang trí */}
        {/* <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20 border border-white/30">
          <Bell className="w-5 h-5" />
        </button> */}
      </div>
    </header>
  )
}