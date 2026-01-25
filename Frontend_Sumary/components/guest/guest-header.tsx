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
      className="bg-brand text-white px-4 py-5"
      style={{
        borderBottomLeftRadius: '22px',
        borderBottomRightRadius: '22px',
      }}
    >
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex flex-col flex-1">
          <span className="font-bold text-lg leading-tight">{title}</span>
          {subtitle && (
            <span className="text-xs opacity-90">{subtitle}</span>
          )}
        </div>
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.25)',
          }}
        >
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
