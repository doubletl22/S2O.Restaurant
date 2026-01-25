import React from "react"
import { StaffSidebar } from '@/components/staff/staff-sidebar'

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      <StaffSidebar />
      <main className="flex-1 lg:ml-0 pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  )
}
