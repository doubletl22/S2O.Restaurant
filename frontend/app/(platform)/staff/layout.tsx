import React from "react"
import { Sidebar } from '@/components/platform/sidebar'

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      <Sidebar type="staff" />
      <main className="flex-1 lg:p-6 p-4 pt-20 lg:pt-6 overflow-auto">
        {children}
      </main>
    </div>
  )
}
