'use client'

import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: LucideIcon
  iconColor?: string
}

export function StatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = '#f97316',
}: StatsCardProps) {
  return (
    <div
      className="bg-white rounded-[20px] p-6 shadow-sm border flex items-start justify-between"
      style={{ borderColor: 'var(--line)' }}
    >
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
          {title}
        </span>
        <span className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
          {value}
        </span>
        {change && (
          <span
            className={cn(
              'text-xs font-medium',
              changeType === 'positive' && 'text-green-500',
              changeType === 'negative' && 'text-red-500',
              changeType === 'neutral' && 'text-gray-500'
            )}
          >
            {change}
          </span>
        )}
      </div>
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: `${iconColor}15` }}
      >
        <Icon className="w-6 h-6" style={{ color: iconColor }} />
      </div>
    </div>
  )
}
